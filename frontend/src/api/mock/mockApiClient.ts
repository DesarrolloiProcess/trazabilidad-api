import type { ApiClient, ListDeliveriesParams, ListRoutesParams } from '#src/api/apiClient.types';
import { ApiError } from '#src/api/types';
import type {
  CreateDistributionCenterInput,
  CreateUserInput,
  DeliveryDto,
  DeliveryEvidenceInput,
  DeliveryStatus,
  DistributionCenterDto,
  ImportResultDto,
  LoginResultDto,
  MyDeliveriesDto,
  PagedResult,
  PendingVerificationDto,
  PublicDeliveryDto,
  RequestOtpResultDto,
  RouteDto,
  RouteStatus,
  UpdateDistributionCenterInput,
  UpdateUserInput,
  UserDto,
} from '#src/api/types';
import { clients, deliveries, distributionCenters, routes, users } from '#src/api/mock/fixtures';
import { delay } from '#src/api/mock/delay';
import { getCurrentUser, setSession } from '#src/api/session';

const DEFAULT_PASSWORD = 'farmatrack123';

const routesStore: RouteDto[] = [...routes];
const deliveriesStore: DeliveryDto[] = [...deliveries];
const usersStore: UserDto[] = [...users];
const distributionCentersStore: DistributionCenterDto[] = [...distributionCenters];

const passwordStore = new Map<string, string>(usersStore.map((u) => [u.id, DEFAULT_PASSWORD]));
const otpStore = new Map<string, { code: string; expiresAt: number }>();

const ROUTE_TRANSITIONS: Record<RouteStatus, RouteStatus[]> = {
  creada: ['asignada'],
  asignada: ['entregada_transportador'],
  entregada_transportador: ['en_curso'],
  en_curso: ['completada', 'con_novedad'],
  completada: [],
  con_novedad: [],
};

const DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  creado: ['alistado'],
  alistado: ['entregado_transportador'],
  entregado_transportador: ['entregado_cliente', 'no_entregado'],
  entregado_cliente: [],
  no_entregado: [],
};

function paginate<T>(items: T[], page = 1, limit = 20): PagedResult<T> {
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);
  return {
    data,
    meta: { page, limit, total: items.length, totalPages: Math.max(1, Math.ceil(items.length / limit)) },
  };
}

function findClientForDelivery(delivery: DeliveryDto) {
  return clients.find((c) => c.id === delivery.clientId) ?? null;
}

function toPublicDeliveryDto(delivery: DeliveryDto): PublicDeliveryDto {
  const isDelivered = delivery.status === 'entregado_cliente';
  return {
    trackingNumber: delivery.trackingNumber,
    status: delivery.status,
    address: delivery.address,
    recipientName: delivery.recipientName,
    products: delivery.products.map(({ code, description, quantity }) => ({ code, description, quantity })),
    deliveredAt: delivery.deliveredAt,
    signatureUrl: isDelivered ? delivery.signatureUrl : null,
    photoUrl: isDelivered ? delivery.photoUrl : null,
    receiverName: isDelivered ? delivery.receiverName : null,
    receiverIdNumber: isDelivered ? delivery.receiverIdNumber : null,
    latitude: isDelivered ? delivery.latitude : null,
    longitude: isDelivered ? delivery.longitude : null,
  };
}

function isClientAccessVerified(verificationValue: string, delivery: DeliveryDto): boolean {
  const client = findClientForDelivery(delivery);
  return (
    verificationValue === delivery.recipientPhone ||
    (delivery.receiverIdNumber !== null && verificationValue === delivery.receiverIdNumber) ||
    (client !== null && verificationValue === client.nit)
  );
}

interface PlanillaRow {
  fecha: string;
  routeCode: string;
  trackingNumber: string;
  clienteNit: string;
  direccion: string;
  destinatarioNombre: string;
  destinatarioTelefono: string;
  productoCodigo: string;
  productoDescripcion: string;
  productoCantidad: string;
  productoPrecio: string;
}

const PLANILLA_COLUMNS = 11;

function parsePlanilla(content: string): { lineNumber: number; row: PlanillaRow }[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new ApiError('El archivo TXT está vacío', 'VALIDATION_ERROR', 422);
  }

  const dataLines = lines.slice(1);
  const errors: string[] = [];

  const rows = dataLines.map((line, index) => {
    const fields = line.split('|').map((f) => f.trim());

    if (fields.length !== PLANILLA_COLUMNS) {
      errors.push(`Línea ${index + 2}: se esperaban ${PLANILLA_COLUMNS} columnas, se encontraron ${fields.length}`);
    }

    const row: PlanillaRow = {
      fecha: fields[0] ?? '',
      routeCode: fields[1] ?? '',
      trackingNumber: fields[2] ?? '',
      clienteNit: fields[3] ?? '',
      direccion: fields[4] ?? '',
      destinatarioNombre: fields[5] ?? '',
      destinatarioTelefono: fields[6] ?? '',
      productoCodigo: fields[7] ?? '',
      productoDescripcion: fields[8] ?? '',
      productoCantidad: fields[9] ?? '',
      productoPrecio: fields[10] ?? '',
    };

    return { lineNumber: index + 2, row };
  });

  if (errors.length > 0) {
    throw new ApiError(`La planilla TXT contiene registros inválidos: ${errors.join('; ')}`, 'VALIDATION_ERROR', 422);
  }

  return rows;
}

function requireCurrentUser(): UserDto {
  const user = getCurrentUser();
  if (!user) {
    throw new ApiError('Debes iniciar sesión para continuar', 'UNAUTHORIZED', 401);
  }
  return user;
}

/**
 * Simula la geocodificación de la dirección al importar la planilla (un sistema real
 * geocodificaría la dirección exacta). Aquí basta un punto plausible cerca del CEDI,
 * con un jitter aleatorio, para poder ubicar la entrega en el mapa de rutas.
 */
const CEDI_COORDS: Record<string, { lat: number; lng: number }> = {
  'cedi-bogota-norte': { lat: 4.75, lng: -74.04 },
  'cedi-medellin': { lat: 6.25, lng: -75.58 },
  'cedi-cali': { lat: 3.45, lng: -76.52 },
  'cedi-barranquilla': { lat: 10.96, lng: -74.8 },
};

function geocodeForDistributionCenter(distributionCenterId: string): {
  destinationLatitude: number;
  destinationLongitude: number;
} {
  const base = CEDI_COORDS[distributionCenterId] ?? { lat: 4.71, lng: -74.07 };
  return {
    destinationLatitude: base.lat + (Math.random() - 0.5) * 0.08,
    destinationLongitude: base.lng + (Math.random() - 0.5) * 0.08,
  };
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const mockApiClient: ApiClient = {
  async login(email, password) {
    await delay();

    const user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const validPassword = user ? (passwordStore.get(user.id) ?? DEFAULT_PASSWORD) : null;

    if (!user || !user.active || password !== validPassword) {
      throw new ApiError('Credenciales inválidas', 'UNAUTHORIZED', 401);
    }

    const token = `mock-jwt.${user.id}.${Date.now()}`;
    setSession(token, user);

    const result: LoginResultDto = { token, user };
    return result;
  },

  async changePassword(currentPassword, newPassword) {
    await delay();
    const currentUser = requireCurrentUser();
    const validPassword = passwordStore.get(currentUser.id) ?? DEFAULT_PASSWORD;

    if (currentPassword !== validPassword) {
      throw new ApiError('La contraseña actual no coincide', 'UNAUTHORIZED', 401);
    }
    if (newPassword.length < 8) {
      throw new ApiError('La nueva contraseña debe tener al menos 8 caracteres', 'VALIDATION_ERROR', 422);
    }

    passwordStore.set(currentUser.id, newPassword);
  },

  async requestPasswordResetOtp(email) {
    await delay(400, 800);
    const user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new ApiError('No encontramos una cuenta con ese correo', 'ENTITY_NOT_FOUND', 404);
    }

    const code = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(email.toLowerCase(), { code, expiresAt });

    const result: RequestOtpResultDto = { otpCode: code, expiresAt: new Date(expiresAt).toISOString() };
    return result;
  },

  async resetPasswordWithOtp(email, otpCode, newPassword) {
    await delay();
    const entry = otpStore.get(email.toLowerCase());
    const user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || !entry) {
      throw new ApiError('Solicita un código antes de continuar', 'BUSINESS_LOGIC_ERROR', 422);
    }
    if (Date.now() > entry.expiresAt) {
      throw new ApiError('El código expiró, solicita uno nuevo', 'BUSINESS_LOGIC_ERROR', 422);
    }
    if (entry.code !== otpCode) {
      throw new ApiError('El código ingresado no es correcto', 'VALIDATION_ERROR', 422);
    }
    if (newPassword.length < 8) {
      throw new ApiError('La nueva contraseña debe tener al menos 8 caracteres', 'VALIDATION_ERROR', 422);
    }

    passwordStore.set(user.id, newPassword);
    otpStore.delete(email.toLowerCase());
  },

  async importTxtPlanilla(content, distributionCenterId) {
    await delay(700, 1400);
    const currentUser = requireCurrentUser();

    const resolvedDistributionCenterId = distributionCenterId ?? currentUser.distributionCenterId;

    if (!resolvedDistributionCenterId) {
      throw new ApiError(
        currentUser.role === 'ADMIN'
          ? 'Selecciona la droguería de origen de esta planilla'
          : 'El usuario que importa la planilla debe pertenecer a una droguería',
        'BUSINESS_LOGIC_ERROR',
        422,
      );
    }

    const rows = parsePlanilla(content);
    const [{ row: firstRow }] = rows;
    const now = new Date().toISOString();

    const route: RouteDto = {
      id: `route-${crypto.randomUUID()}`,
      code: firstRow.routeCode,
      distributionCenterId: resolvedDistributionCenterId,
      driverId: null,
      date: new Date(firstRow.fecha || Date.now()).toISOString(),
      status: 'creada',
      createdAt: now,
      updatedAt: now,
    };

    const grouped = new Map<string, PlanillaRow[]>();
    for (const { row } of rows) {
      const existing = grouped.get(row.trackingNumber) ?? [];
      existing.push(row);
      grouped.set(row.trackingNumber, existing);
    }

    const trackingNumbers = [...grouped.keys()];

    for (const trackingNumber of trackingNumbers) {
      const groupRows = grouped.get(trackingNumber)!;
      const [first] = groupRows;

      // clienteNit identifica al convenio/EPS que paga, no al paciente (eso es destinatarioNombre, ya usado
      // abajo en recipientName) — sin NIT, todas las entregas particulares comparten un cliente "Particular".
      const normalizedNit = first.clienteNit.trim();
      let client = clients.find((c) => c.nit === normalizedNit);
      if (!client) {
        client = {
          id: `client-${crypto.randomUUID()}`,
          nit: normalizedNit,
          name: normalizedNit === '' ? 'Particular' : `Convenio ${normalizedNit}`,
          phone: normalizedNit === '' ? '' : first.destinatarioTelefono,
        };
        clients.push(client);
      }

      const delivery: DeliveryDto = {
        id: `del-${crypto.randomUUID()}`,
        routeId: route.id,
        clientId: client.id,
        trackingNumber,
        address: first.direccion,
        recipientName: first.destinatarioNombre,
        recipientPhone: first.destinatarioTelefono,
        products: groupRows.map((r) => ({
          code: r.productoCodigo,
          description: r.productoDescripcion,
          quantity: Number(r.productoCantidad) || 0,
          price: Number(r.productoPrecio) || 0,
        })),
        status: 'creado',
        signatureUrl: null,
        photoUrl: null,
        receiverName: null,
        receiverIdNumber: null,
        latitude: null,
        longitude: null,
        ...geocodeForDistributionCenter(resolvedDistributionCenterId),
        observation: null,
        deliveredAt: null,
        invoiced: false,
        invoicedAt: null,
        createdAt: now,
        updatedAt: now,
      };

      deliveriesStore.unshift(delivery);
    }

    routesStore.unshift(route);

    const result: ImportResultDto = {
      routeId: route.id,
      routeCode: route.code,
      distributionCenterId: route.distributionCenterId,
      date: route.date,
      deliveriesCount: trackingNumbers.length,
      trackingNumbers,
    };

    return result;
  },

  async listRoutes(params: ListRoutesParams) {
    await delay();
    let items = routesStore;

    if (params.distributionCenterId) {
      items = items.filter((r) => r.distributionCenterId === params.distributionCenterId);
    }
    if (params.driverId) {
      items = items.filter((r) => r.driverId === params.driverId);
    }

    items = [...items].sort((a, b) => b.date.localeCompare(a.date));

    return paginate(items, params.page, params.limit);
  },

  async getRouteById(id) {
    await delay();
    const route = routesStore.find((r) => r.id === id);
    if (!route) throw new ApiError(`Ruta no encontrada: ${id}`, 'ENTITY_NOT_FOUND', 404);
    return route;
  },

  async assignDriver(routeId, driverId) {
    await delay();
    const route = routesStore.find((r) => r.id === routeId);
    if (!route) throw new ApiError(`Ruta no encontrada: ${routeId}`, 'ENTITY_NOT_FOUND', 404);

    if (route.driverId !== null) {
      throw new ApiError('La ruta ya tiene un conductor asignado', 'BUSINESS_LOGIC_ERROR', 422);
    }

    const driver = usersStore.find((u) => u.id === driverId);
    if (!driver || driver.role !== 'CONDUCTOR' || !driver.active) {
      throw new ApiError('El conductor indicado no existe o no está activo', 'BUSINESS_LOGIC_ERROR', 422);
    }

    route.driverId = driverId;
    route.status = 'asignada';
    route.updatedAt = new Date().toISOString();
    return route;
  },

  async updateRouteStatus(routeId, status) {
    await delay();
    const route = routesStore.find((r) => r.id === routeId);
    if (!route) throw new ApiError(`Ruta no encontrada: ${routeId}`, 'ENTITY_NOT_FOUND', 404);

    const allowed = ROUTE_TRANSITIONS[route.status];
    if (!allowed.includes(status)) {
      throw new ApiError(`No se puede cambiar la ruta de '${route.status}' a '${status}'`, 'BUSINESS_LOGIC_ERROR', 422);
    }

    route.status = status;
    route.updatedAt = new Date().toISOString();
    return route;
  },

  async listPendingVerification(distributionCenterId) {
    await delay();

    const pendingRoutes = routesStore.filter((r) => r.distributionCenterId === distributionCenterId);

    const result: PendingVerificationDto[] = pendingRoutes
      .map((route) => ({
        route,
        deliveries: deliveriesStore.filter((d) => d.routeId === route.id && d.status === 'creado'),
      }))
      .filter((entry) => entry.deliveries.length > 0)
      .sort((a, b) => a.route.date.localeCompare(b.route.date));

    return result;
  },

  async verifyRoute(routeId) {
    await delay(500, 1000);
    const route = routesStore.find((r) => r.id === routeId);
    if (!route) throw new ApiError(`Ruta no encontrada: ${routeId}`, 'ENTITY_NOT_FOUND', 404);

    const pending = deliveriesStore.filter((d) => d.routeId === routeId && d.status === 'creado');
    if (pending.length === 0) {
      throw new ApiError('Esta planilla no tiene entregas pendientes por verificar', 'BUSINESS_LOGIC_ERROR', 422);
    }

    const now = new Date().toISOString();
    for (const delivery of pending) {
      delivery.status = 'alistado';
      delivery.updatedAt = now;
    }

    return pending;
  },

  async listDeliveries(params: ListDeliveriesParams) {
    await delay();
    let items = deliveriesStore;

    if (params.routeId) {
      items = items.filter((d) => d.routeId === params.routeId);
    }

    items = [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    return paginate(items, params.page, params.limit);
  },

  async getDeliveryById(id) {
    await delay();
    const delivery = deliveriesStore.find((d) => d.id === id);
    if (!delivery) throw new ApiError(`Entrega no encontrada: ${id}`, 'ENTITY_NOT_FOUND', 404);
    return delivery;
  },

  async advanceDeliveryStatus(id, status: DeliveryStatus) {
    await delay();
    const delivery = deliveriesStore.find((d) => d.id === id);
    if (!delivery) throw new ApiError(`Entrega no encontrada: ${id}`, 'ENTITY_NOT_FOUND', 404);

    const allowed = DELIVERY_TRANSITIONS[delivery.status];
    if (!allowed.includes(status)) {
      throw new ApiError(`No se puede cambiar la entrega de '${delivery.status}' a '${status}'`, 'BUSINESS_LOGIC_ERROR', 422);
    }

    delivery.status = status;
    delivery.updatedAt = new Date().toISOString();
    return delivery;
  },

  async submitDeliveryEvidence(id, data: DeliveryEvidenceInput) {
    await delay(700, 1300);
    const delivery = deliveriesStore.find((d) => d.id === id);
    if (!delivery) throw new ApiError(`Entrega no encontrada: ${id}`, 'ENTITY_NOT_FOUND', 404);

    const allowed = DELIVERY_TRANSITIONS[delivery.status];
    if (!allowed.includes('entregado_cliente')) {
      throw new ApiError(`No se puede confirmar la entrega desde el estado '${delivery.status}'`, 'BUSINESS_LOGIC_ERROR', 422);
    }

    const now = new Date().toISOString();
    delivery.status = 'entregado_cliente';
    delivery.signatureUrl = data.signatureUrl;
    delivery.photoUrl = data.photoUrl;
    delivery.receiverName = data.receiverName;
    delivery.receiverIdNumber = data.receiverIdNumber;
    delivery.latitude = data.latitude;
    delivery.longitude = data.longitude;
    delivery.deliveredAt = now;
    delivery.updatedAt = now;

    return delivery;
  },

  async markNotDelivered(id, observation) {
    await delay();
    const delivery = deliveriesStore.find((d) => d.id === id);
    if (!delivery) throw new ApiError(`Entrega no encontrada: ${id}`, 'ENTITY_NOT_FOUND', 404);

    const allowed = DELIVERY_TRANSITIONS[delivery.status];
    if (!allowed.includes('no_entregado')) {
      throw new ApiError(`No se puede marcar como no entregada desde el estado '${delivery.status}'`, 'BUSINESS_LOGIC_ERROR', 422);
    }

    const now = new Date().toISOString();
    delivery.status = 'no_entregado';
    delivery.observation = observation;
    delivery.deliveredAt = now;
    delivery.updatedAt = now;

    return delivery;
  },

  async exportInvoice(id) {
    await delay(400, 900);
    const delivery = deliveriesStore.find((d) => d.id === id);
    if (!delivery) throw new ApiError(`Entrega no encontrada: ${id}`, 'ENTITY_NOT_FOUND', 404);

    if (delivery.status !== 'entregado_cliente') {
      throw new ApiError('Solo se puede exportar a facturación una entrega ya confirmada', 'BUSINESS_LOGIC_ERROR', 422);
    }
    if (delivery.invoiced) {
      throw new ApiError('Esta entrega ya fue exportada a facturación', 'BUSINESS_LOGIC_ERROR', 422);
    }

    const now = new Date().toISOString();
    delivery.invoiced = true;
    delivery.invoicedAt = now;
    delivery.updatedAt = now;

    return delivery;
  },

  async listDistributionCenters(): Promise<DistributionCenterDto[]> {
    await delay();
    return distributionCentersStore;
  },

  async createDistributionCenter(input: CreateDistributionCenterInput) {
    await delay();
    const now = new Date().toISOString();
    const cedi: DistributionCenterDto = {
      id: `cedi-${crypto.randomUUID()}`,
      name: input.name,
      city: input.city,
      address: input.address,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    distributionCentersStore.unshift(cedi);
    return cedi;
  },

  async updateDistributionCenter(id, input: UpdateDistributionCenterInput) {
    await delay();
    const cedi = distributionCentersStore.find((c) => c.id === id);
    if (!cedi) throw new ApiError(`Droguería no encontrada: ${id}`, 'ENTITY_NOT_FOUND', 404);

    if (input.name !== undefined) cedi.name = input.name;
    if (input.city !== undefined) cedi.city = input.city;
    if (input.address !== undefined) cedi.address = input.address;
    if (input.active !== undefined) cedi.active = input.active;
    cedi.updatedAt = new Date().toISOString();

    return cedi;
  },

  async listDrivers(): Promise<UserDto[]> {
    await delay();
    return usersStore.filter((u) => u.role === 'CONDUCTOR');
  },

  async listUsers(): Promise<UserDto[]> {
    await delay();
    return usersStore;
  },

  async createUser(input: CreateUserInput) {
    await delay();
    if (usersStore.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new ApiError('Ya existe un usuario con ese correo', 'BUSINESS_LOGIC_ERROR', 422);
    }
    if (input.role !== 'ADMIN' && !input.distributionCenterId) {
      throw new ApiError('Los usuarios de droguería y los conductores deben pertenecer a una droguería', 'VALIDATION_ERROR', 422);
    }

    const now = new Date().toISOString();
    const user: UserDto = {
      id: `user-${crypto.randomUUID()}`,
      email: input.email,
      name: input.name,
      role: input.role,
      distributionCenterId: input.role === 'ADMIN' ? null : input.distributionCenterId,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    usersStore.unshift(user);
    passwordStore.set(user.id, DEFAULT_PASSWORD);
    return user;
  },

  async updateUser(id, input: UpdateUserInput) {
    await delay();
    const user = usersStore.find((u) => u.id === id);
    if (!user) throw new ApiError(`Usuario no encontrado: ${id}`, 'ENTITY_NOT_FOUND', 404);

    if (input.name !== undefined) user.name = input.name;
    if (input.role !== undefined) user.role = input.role;
    if (input.distributionCenterId !== undefined) user.distributionCenterId = input.distributionCenterId;
    if (input.active !== undefined) user.active = input.active;
    user.updatedAt = new Date().toISOString();

    return user;
  },

  async trackDelivery(trackingNumber, verificationValue) {
    await delay();
    const delivery = deliveriesStore.find((d) => d.trackingNumber.toUpperCase() === trackingNumber.toUpperCase());

    if (!delivery) {
      throw new ApiError(`No encontramos un pedido con la guía ${trackingNumber}`, 'ENTITY_NOT_FOUND', 404);
    }

    if (!isClientAccessVerified(verificationValue, delivery)) {
      throw new ApiError('Los datos de verificación no coinciden con el pedido', 'FORBIDDEN', 403);
    }

    return toPublicDeliveryDto(delivery);
  },

  async listMyDeliveries(trackingNumber, verificationValue) {
    await delay();
    const delivery = deliveriesStore.find((d) => d.trackingNumber.toUpperCase() === trackingNumber.toUpperCase());

    if (!delivery) {
      throw new ApiError(`No encontramos un pedido con la guía ${trackingNumber}`, 'ENTITY_NOT_FOUND', 404);
    }

    if (!isClientAccessVerified(verificationValue, delivery)) {
      throw new ApiError('Los datos de verificación no coinciden con el pedido', 'FORBIDDEN', 403);
    }

    const client = findClientForDelivery(delivery)!;
    const clientDeliveries = deliveriesStore.filter((d) => d.clientId === client.id);

    const result: MyDeliveriesDto = {
      client: { nit: client.nit, name: client.name },
      deliveries: clientDeliveries.map(toPublicDeliveryDto),
    };

    return result;
  },
};
