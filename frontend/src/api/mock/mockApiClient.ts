import type { ApiClient, ListDeliveriesParams, ListRoutesParams } from '#src/api/apiClient.types';
import { ApiError } from '#src/api/types';
import type {
  DeliveryDto,
  DeliveryEvidenceInput,
  DeliveryStatus,
  DistributionCenterDto,
  ImportResultDto,
  LoginResultDto,
  MyDeliveriesDto,
  PagedResult,
  PublicDeliveryDto,
  RouteDto,
  RouteStatus,
  UserDto,
} from '#src/api/types';
import { clients, deliveries, distributionCenters, routes, users } from '#src/api/mock/fixtures';
import { delay } from '#src/api/mock/delay';
import { getCurrentUser, setSession } from '#src/api/session';

const MOCK_PASSWORD = 'farmatrack123';

const routesStore: RouteDto[] = [...routes];
const deliveriesStore: DeliveryDto[] = [...deliveries];

const ROUTE_TRANSITIONS: Record<RouteStatus, RouteStatus[]> = {
  creada: ['entregada_transportador'],
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
  return {
    trackingNumber: delivery.trackingNumber,
    status: delivery.status,
    address: delivery.address,
    recipientName: delivery.recipientName,
    products: delivery.products.map(({ code, description, quantity }) => ({ code, description, quantity })),
    deliveredAt: delivery.deliveredAt,
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

export const mockApiClient: ApiClient = {
  async login(email, password) {
    await delay();

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || !user.active || password !== MOCK_PASSWORD) {
      throw new ApiError('Credenciales inválidas', 'UNAUTHORIZED', 401);
    }

    const token = `mock-jwt.${user.id}.${Date.now()}`;
    setSession(token, user);

    const result: LoginResultDto = { token, user };
    return result;
  },

  async importTxtPlanilla(content) {
    await delay(700, 1400);
    const currentUser = requireCurrentUser();

    if (!currentUser.distributionCenterId) {
      throw new ApiError('El usuario que importa la planilla debe pertenecer a un CEDI', 'BUSINESS_LOGIC_ERROR', 422);
    }

    const rows = parsePlanilla(content);
    const [{ row: firstRow }] = rows;
    const now = new Date().toISOString();

    const route: RouteDto = {
      id: `route-${crypto.randomUUID()}`,
      code: firstRow.routeCode,
      distributionCenterId: currentUser.distributionCenterId,
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

      let client = clients.find((c) => c.nit === first.clienteNit);
      if (!client) {
        client = { id: `client-${crypto.randomUUID()}`, nit: first.clienteNit, name: first.destinatarioNombre, phone: first.destinatarioTelefono };
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
        observation: null,
        deliveredAt: null,
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

    const driver = users.find((u) => u.id === driverId);
    if (!driver || driver.role !== 'CONDUCTOR' || !driver.active) {
      throw new ApiError('El conductor indicado no existe o no está activo', 'BUSINESS_LOGIC_ERROR', 422);
    }

    route.driverId = driverId;
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

  async listDistributionCenters(): Promise<DistributionCenterDto[]> {
    await delay();
    return distributionCenters;
  },

  async listDrivers(): Promise<UserDto[]> {
    await delay();
    return users.filter((u) => u.role === 'CONDUCTOR');
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
