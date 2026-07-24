import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { clients, deliveries, distributionCenters, routes, users, newId } from './fixtures.js';

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'farmatrack-demo-secret-not-for-production';
const DEFAULT_PASSWORD = 'farmatrack123';

const routesStore = [...routes];
const deliveriesStore = [...deliveries];
const clientsStore = [...clients];
const usersStore = [...users];
const distributionCentersStore = [...distributionCenters];

const passwordStore = new Map(usersStore.map((u) => [u.id, DEFAULT_PASSWORD]));
const otpStore = new Map();

/**
 * Simula la geocodificación de la dirección al importar la planilla (un sistema real
 * geocodificaría la dirección exacta). Aquí basta un punto plausible cerca del CEDI,
 * con un jitter aleatorio, para poder ubicar la entrega en el mapa de rutas.
 */
const CEDI_COORDS = {
  'cedi-bogota-norte': { lat: 4.75, lng: -74.04 },
  'cedi-medellin': { lat: 6.25, lng: -75.58 },
  'cedi-cali': { lat: 3.45, lng: -76.52 },
  'cedi-barranquilla': { lat: 10.96, lng: -74.8 },
};

function geocodeForDistributionCenter(distributionCenterId) {
  const base = CEDI_COORDS[distributionCenterId] ?? { lat: 4.71, lng: -74.07 };
  return {
    destinationLatitude: base.lat + (Math.random() - 0.5) * 0.08,
    destinationLongitude: base.lng + (Math.random() - 0.5) * 0.08,
  };
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const ROUTE_TRANSITIONS = {
  creada: ['entregada_transportador'],
  entregada_transportador: ['en_curso'],
  en_curso: ['completada', 'con_novedad'],
  completada: [],
  con_novedad: [],
};

const DELIVERY_TRANSITIONS = {
  creado: ['alistado'],
  alistado: ['entregado_transportador'],
  entregado_transportador: ['entregado_cliente', 'no_entregado'],
  entregado_cliente: [],
  no_entregado: [],
};

function apiError(res, status, message, code) {
  res.status(status).json({ message, code });
}

function paginate(items, page = 1, limit = 20) {
  const p = Number(page) || 1;
  const l = Number(limit) || 20;
  const start = (p - 1) * l;
  const data = items.slice(start, start + l);
  return { data, meta: { page: p, limit: l, total: items.length, totalPages: Math.max(1, Math.ceil(items.length / l)) } };
}

function findClientForDelivery(delivery) {
  return clientsStore.find((c) => c.id === delivery.clientId) ?? null;
}

function toPublicDeliveryDto(delivery) {
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

function isClientAccessVerified(verificationValue, delivery) {
  const client = findClientForDelivery(delivery);
  return (
    verificationValue === delivery.recipientPhone ||
    (delivery.receiverIdNumber !== null && verificationValue === delivery.receiverIdNumber) ||
    (client !== null && verificationValue === client.nit)
  );
}

const PLANILLA_COLUMNS = 11;

function parsePlanilla(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    const err = new Error('El archivo TXT está vacío');
    err.status = 422;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const dataLines = lines.slice(1);
  const errors = [];

  const rows = dataLines.map((line, index) => {
    const fields = line.split('|').map((f) => f.trim());
    if (fields.length !== PLANILLA_COLUMNS) {
      errors.push(`Línea ${index + 2}: se esperaban ${PLANILLA_COLUMNS} columnas, se encontraron ${fields.length}`);
    }
    return {
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
  });

  if (errors.length > 0) {
    const err = new Error(`La planilla TXT contiene registros inválidos: ${errors.join('; ')}`);
    err.status = 422;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  return rows;
}

// ---------------------------------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return apiError(res, 401, 'Debes iniciar sesión para continuar', 'UNAUTHORIZED');
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    req.user = payload.user;
    next();
  } catch {
    return apiError(res, 401, 'Sesión inválida o expirada', 'UNAUTHORIZED');
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return apiError(res, 403, 'No tienes permiso para esta acción', 'FORBIDDEN');
    }
    next();
  };
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body ?? {};
  const user = usersStore.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  const validPassword = user ? passwordStore.get(user.id) ?? DEFAULT_PASSWORD : null;

  if (!user || !user.active || password !== validPassword) {
    return apiError(res, 401, 'Credenciales inválidas', 'UNAUTHORIZED');
  }

  const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user });
});

app.post('/api/users/change-password', auth, (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  const validPassword = passwordStore.get(req.user.id) ?? DEFAULT_PASSWORD;

  if (currentPassword !== validPassword) {
    return apiError(res, 401, 'La contraseña actual no coincide', 'UNAUTHORIZED');
  }
  if (!newPassword || newPassword.length < 8) {
    return apiError(res, 422, 'La nueva contraseña debe tener al menos 8 caracteres', 'VALIDATION_ERROR');
  }

  passwordStore.set(req.user.id, newPassword);
  res.status(204).end();
});

app.post('/api/users/request-otp', (req, res) => {
  const { email } = req.body ?? {};
  const user = usersStore.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) {
    return apiError(res, 404, 'No encontramos una cuenta con ese correo', 'ENTITY_NOT_FOUND');
  }

  const code = generateOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  otpStore.set(email.toLowerCase(), { code, expiresAt });

  res.json({ otpCode: code, expiresAt: new Date(expiresAt).toISOString() });
});

app.post('/api/users/reset-password', (req, res) => {
  const { email, otpCode, newPassword } = req.body ?? {};
  const entry = otpStore.get(String(email).toLowerCase());
  const user = usersStore.find((u) => u.email.toLowerCase() === String(email).toLowerCase());

  if (!user || !entry) {
    return apiError(res, 422, 'Solicita un código antes de continuar', 'BUSINESS_LOGIC_ERROR');
  }
  if (Date.now() > entry.expiresAt) {
    return apiError(res, 422, 'El código expiró, solicita uno nuevo', 'BUSINESS_LOGIC_ERROR');
  }
  if (entry.code !== otpCode) {
    return apiError(res, 422, 'El código ingresado no es correcto', 'VALIDATION_ERROR');
  }
  if (!newPassword || newPassword.length < 8) {
    return apiError(res, 422, 'La nueva contraseña debe tener al menos 8 caracteres', 'VALIDATION_ERROR');
  }

  passwordStore.set(user.id, newPassword);
  otpStore.delete(String(email).toLowerCase());
  res.status(204).end();
});

app.post('/api/txt-import', auth, requireRole('ADMIN', 'CEDI'), (req, res) => {
  const { content, distributionCenterId } = req.body ?? {};
  const resolvedDistributionCenterId = distributionCenterId || req.user.distributionCenterId;

  if (!resolvedDistributionCenterId) {
    return apiError(
      res,
      422,
      req.user.role === 'ADMIN' ? 'Selecciona la droguería de origen de esta planilla' : 'El usuario que importa la planilla debe pertenecer a una droguería',
      'BUSINESS_LOGIC_ERROR',
    );
  }

  let rows;
  try {
    rows = parsePlanilla(content ?? '');
  } catch (err) {
    return apiError(res, err.status ?? 400, err.message, err.code ?? 'VALIDATION_ERROR');
  }

  const [{ routeCode, fecha }] = rows;
  const now = new Date().toISOString();

  const route = {
    id: newId('route'),
    code: routeCode,
    distributionCenterId: resolvedDistributionCenterId,
    driverId: null,
    date: new Date(fecha || Date.now()).toISOString(),
    status: 'creada',
    createdAt: now,
    updatedAt: now,
  };

  const grouped = new Map();
  for (const row of rows) {
    const existing = grouped.get(row.trackingNumber) ?? [];
    existing.push(row);
    grouped.set(row.trackingNumber, existing);
  }

  const trackingNumbers = [...grouped.keys()];

  for (const trackingNumber of trackingNumbers) {
    const groupRows = grouped.get(trackingNumber);
    const [first] = groupRows;

    // clienteNit identifica al convenio/EPS que paga, no al paciente (eso es destinatarioNombre, usado en
    // recipientName) — sin NIT, todas las entregas particulares comparten un cliente "Particular".
    const normalizedNit = (first.clienteNit || '').trim();
    let client = clientsStore.find((c) => c.nit === normalizedNit);
    if (!client) {
      client = {
        id: newId('client'),
        nit: normalizedNit,
        name: normalizedNit === '' ? 'Particular' : `Convenio ${normalizedNit}`,
        phone: normalizedNit === '' ? '' : first.destinatarioTelefono,
      };
      clientsStore.push(client);
    }

    deliveriesStore.unshift({
      id: newId('del'),
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
    });
  }

  routesStore.unshift(route);

  res.status(201).json({
    routeId: route.id,
    routeCode: route.code,
    distributionCenterId: route.distributionCenterId,
    date: route.date,
    deliveriesCount: trackingNumbers.length,
    trackingNumbers,
  });
});

app.get('/api/routes', auth, (req, res) => {
  let items = routesStore;
  if (req.query.distributionCenterId) items = items.filter((r) => r.distributionCenterId === req.query.distributionCenterId);
  if (req.query.driverId) items = items.filter((r) => r.driverId === req.query.driverId);
  items = [...items].sort((a, b) => b.date.localeCompare(a.date));
  res.json(paginate(items, req.query.page, req.query.limit));
});

app.get('/api/routes/:id', auth, (req, res) => {
  const route = routesStore.find((r) => r.id === req.params.id);
  if (!route) return apiError(res, 404, `Ruta no encontrada: ${req.params.id}`, 'ENTITY_NOT_FOUND');
  res.json(route);
});

app.patch('/api/routes/:id/assign-driver', auth, requireRole('ADMIN'), (req, res) => {
  const route = routesStore.find((r) => r.id === req.params.id);
  if (!route) return apiError(res, 404, `Ruta no encontrada: ${req.params.id}`, 'ENTITY_NOT_FOUND');
  if (route.driverId !== null) return apiError(res, 422, 'La ruta ya tiene un conductor asignado', 'BUSINESS_LOGIC_ERROR');

  const driver = usersStore.find((u) => u.id === req.body?.driverId);
  if (!driver || driver.role !== 'CONDUCTOR' || !driver.active) {
    return apiError(res, 422, 'El conductor indicado no existe o no está activo', 'BUSINESS_LOGIC_ERROR');
  }

  route.driverId = driver.id;
  route.updatedAt = new Date().toISOString();
  res.json(route);
});

app.patch('/api/routes/:id/status', auth, requireRole('ADMIN'), (req, res) => {
  const route = routesStore.find((r) => r.id === req.params.id);
  if (!route) return apiError(res, 404, `Ruta no encontrada: ${req.params.id}`, 'ENTITY_NOT_FOUND');

  const allowed = ROUTE_TRANSITIONS[route.status] ?? [];
  if (!allowed.includes(req.body?.status)) {
    return apiError(res, 422, `No se puede cambiar la ruta de '${route.status}' a '${req.body?.status}'`, 'BUSINESS_LOGIC_ERROR');
  }

  route.status = req.body.status;
  route.updatedAt = new Date().toISOString();
  res.json(route);
});

app.get('/api/cdi/pending-verification', auth, requireRole('CEDI', 'ADMIN'), (req, res) => {
  const distributionCenterId = req.query.distributionCenterId;
  const pendingRoutes = routesStore.filter((r) => r.distributionCenterId === distributionCenterId);

  const result = pendingRoutes
    .map((route) => ({ route, deliveries: deliveriesStore.filter((d) => d.routeId === route.id && d.status === 'creado') }))
    .filter((entry) => entry.deliveries.length > 0)
    .sort((a, b) => a.route.date.localeCompare(b.route.date));

  res.json(result);
});

app.post('/api/cdi/routes/:id/verify', auth, requireRole('CEDI', 'ADMIN'), (req, res) => {
  const route = routesStore.find((r) => r.id === req.params.id);
  if (!route) return apiError(res, 404, `Ruta no encontrada: ${req.params.id}`, 'ENTITY_NOT_FOUND');

  const pending = deliveriesStore.filter((d) => d.routeId === req.params.id && d.status === 'creado');
  if (pending.length === 0) {
    return apiError(res, 422, 'Esta planilla no tiene entregas pendientes por verificar', 'BUSINESS_LOGIC_ERROR');
  }

  const now = new Date().toISOString();
  for (const delivery of pending) {
    delivery.status = 'alistado';
    delivery.updatedAt = now;
  }

  res.json(pending);
});

app.get('/api/deliveries', auth, (req, res) => {
  let items = deliveriesStore;
  if (req.query.routeId) items = items.filter((d) => d.routeId === req.query.routeId);
  items = [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.json(paginate(items, req.query.page, req.query.limit));
});

app.get('/api/deliveries/:id', auth, (req, res) => {
  const delivery = deliveriesStore.find((d) => d.id === req.params.id);
  if (!delivery) return apiError(res, 404, `Entrega no encontrada: ${req.params.id}`, 'ENTITY_NOT_FOUND');
  res.json(delivery);
});

app.patch('/api/deliveries/:id/status', auth, (req, res) => {
  const delivery = deliveriesStore.find((d) => d.id === req.params.id);
  if (!delivery) return apiError(res, 404, `Entrega no encontrada: ${req.params.id}`, 'ENTITY_NOT_FOUND');

  const allowed = DELIVERY_TRANSITIONS[delivery.status] ?? [];
  if (!allowed.includes(req.body?.status)) {
    return apiError(res, 422, `No se puede cambiar la entrega de '${delivery.status}' a '${req.body?.status}'`, 'BUSINESS_LOGIC_ERROR');
  }

  delivery.status = req.body.status;
  delivery.updatedAt = new Date().toISOString();
  res.json(delivery);
});

app.post('/api/deliveries/:id/evidence', auth, requireRole('CONDUCTOR'), (req, res) => {
  const delivery = deliveriesStore.find((d) => d.id === req.params.id);
  if (!delivery) return apiError(res, 404, `Entrega no encontrada: ${req.params.id}`, 'ENTITY_NOT_FOUND');

  const allowed = DELIVERY_TRANSITIONS[delivery.status] ?? [];
  if (!allowed.includes('entregado_cliente')) {
    return apiError(res, 422, `No se puede confirmar la entrega desde el estado '${delivery.status}'`, 'BUSINESS_LOGIC_ERROR');
  }

  const { signatureUrl, photoUrl, receiverName, receiverIdNumber, latitude, longitude } = req.body ?? {};
  if (!signatureUrl || !photoUrl || !receiverName || !receiverIdNumber || latitude == null || longitude == null) {
    return apiError(res, 422, 'Faltan datos obligatorios de la evidencia de entrega', 'VALIDATION_ERROR');
  }

  const now = new Date().toISOString();
  Object.assign(delivery, {
    status: 'entregado_cliente',
    signatureUrl,
    photoUrl,
    receiverName,
    receiverIdNumber,
    latitude,
    longitude,
    deliveredAt: now,
    updatedAt: now,
  });

  res.json(delivery);
});

app.post('/api/deliveries/:id/not-delivered', auth, requireRole('CONDUCTOR'), (req, res) => {
  const delivery = deliveriesStore.find((d) => d.id === req.params.id);
  if (!delivery) return apiError(res, 404, `Entrega no encontrada: ${req.params.id}`, 'ENTITY_NOT_FOUND');

  const allowed = DELIVERY_TRANSITIONS[delivery.status] ?? [];
  if (!allowed.includes('no_entregado')) {
    return apiError(res, 422, `No se puede marcar como no entregada desde el estado '${delivery.status}'`, 'BUSINESS_LOGIC_ERROR');
  }

  if (!req.body?.observation?.trim()) {
    return apiError(res, 422, 'La observación es obligatoria para marcar una entrega como no entregada', 'VALIDATION_ERROR');
  }

  const now = new Date().toISOString();
  delivery.status = 'no_entregado';
  delivery.observation = req.body.observation;
  delivery.deliveredAt = now;
  delivery.updatedAt = now;

  res.json(delivery);
});

app.post('/api/deliveries/:id/export-invoice', auth, requireRole('ADMIN'), (req, res) => {
  const delivery = deliveriesStore.find((d) => d.id === req.params.id);
  if (!delivery) return apiError(res, 404, `Entrega no encontrada: ${req.params.id}`, 'ENTITY_NOT_FOUND');

  if (delivery.status !== 'entregado_cliente') {
    return apiError(res, 422, 'Solo se puede exportar a facturación una entrega ya confirmada', 'BUSINESS_LOGIC_ERROR');
  }
  if (delivery.invoiced) {
    return apiError(res, 422, 'Esta entrega ya fue exportada a facturación', 'BUSINESS_LOGIC_ERROR');
  }

  const now = new Date().toISOString();
  delivery.invoiced = true;
  delivery.invoicedAt = now;
  delivery.updatedAt = now;

  res.json(delivery);
});

app.get('/api/distribution-centers', auth, (req, res) => {
  res.json(paginate(distributionCentersStore, req.query.page, req.query.limit));
});

app.post('/api/distribution-centers', auth, requireRole('ADMIN'), (req, res) => {
  const { name, city, address } = req.body ?? {};
  if (!name?.trim() || !city?.trim() || !address?.trim()) {
    return apiError(res, 422, 'Nombre, ciudad y dirección son obligatorios', 'VALIDATION_ERROR');
  }

  const now = new Date().toISOString();
  const cedi = {
    id: newId('cedi'),
    name: name.trim(),
    city: city.trim(),
    address: address.trim(),
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  distributionCentersStore.unshift(cedi);
  res.status(201).json(cedi);
});

app.patch('/api/distribution-centers/:id', auth, requireRole('ADMIN'), (req, res) => {
  const cedi = distributionCentersStore.find((c) => c.id === req.params.id);
  if (!cedi) return apiError(res, 404, `Droguería no encontrada: ${req.params.id}`, 'ENTITY_NOT_FOUND');

  const { name, city, address, active } = req.body ?? {};
  if (name !== undefined) cedi.name = name;
  if (city !== undefined) cedi.city = city;
  if (address !== undefined) cedi.address = address;
  if (active !== undefined) cedi.active = active;
  cedi.updatedAt = new Date().toISOString();

  res.json(cedi);
});

app.get('/api/users', auth, (req, res) => {
  const items = req.query.role ? usersStore.filter((u) => u.role === req.query.role) : usersStore;
  res.json(paginate(items, req.query.page, req.query.limit));
});

app.post('/api/users', auth, requireRole('ADMIN'), (req, res) => {
  const { email, name, role, distributionCenterId } = req.body ?? {};
  if (!email?.trim() || !name?.trim() || !role) {
    return apiError(res, 422, 'Correo, nombre y rol son obligatorios', 'VALIDATION_ERROR');
  }
  if (usersStore.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
    return apiError(res, 422, 'Ya existe un usuario con ese correo', 'BUSINESS_LOGIC_ERROR');
  }
  if (role !== 'ADMIN' && !distributionCenterId) {
    return apiError(res, 422, 'Los usuarios de droguería y los conductores deben pertenecer a una droguería', 'VALIDATION_ERROR');
  }

  const now = new Date().toISOString();
  const user = {
    id: newId('user'),
    email: email.trim(),
    name: name.trim(),
    role,
    distributionCenterId: role === 'ADMIN' ? null : distributionCenterId,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  usersStore.unshift(user);
  passwordStore.set(user.id, DEFAULT_PASSWORD);
  res.status(201).json(user);
});

app.patch('/api/users/:id', auth, requireRole('ADMIN'), (req, res) => {
  const user = usersStore.find((u) => u.id === req.params.id);
  if (!user) return apiError(res, 404, `Usuario no encontrado: ${req.params.id}`, 'ENTITY_NOT_FOUND');

  const { name, role, distributionCenterId, active } = req.body ?? {};
  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (distributionCenterId !== undefined) user.distributionCenterId = distributionCenterId;
  if (active !== undefined) user.active = active;
  user.updatedAt = new Date().toISOString();

  res.json(user);
});

app.get('/portal/deliveries/:trackingNumber', (req, res) => {
  const delivery = deliveriesStore.find((d) => d.trackingNumber.toUpperCase() === req.params.trackingNumber.toUpperCase());
  if (!delivery) return apiError(res, 404, `No encontramos un pedido con la guía ${req.params.trackingNumber}`, 'ENTITY_NOT_FOUND');
  if (!isClientAccessVerified(String(req.query.verificationValue ?? ''), delivery)) {
    return apiError(res, 403, 'Los datos de verificación no coinciden con el pedido', 'FORBIDDEN');
  }
  res.json(toPublicDeliveryDto(delivery));
});

app.get('/portal/my-deliveries/:trackingNumber', (req, res) => {
  const delivery = deliveriesStore.find((d) => d.trackingNumber.toUpperCase() === req.params.trackingNumber.toUpperCase());
  if (!delivery) return apiError(res, 404, `No encontramos un pedido con la guía ${req.params.trackingNumber}`, 'ENTITY_NOT_FOUND');
  if (!isClientAccessVerified(String(req.query.verificationValue ?? ''), delivery)) {
    return apiError(res, 403, 'Los datos de verificación no coinciden con el pedido', 'FORBIDDEN');
  }

  const client = findClientForDelivery(delivery);
  const clientDeliveries = deliveriesStore.filter((d) => d.clientId === client.id);

  res.json({ client: { nit: client.nit, name: client.name }, deliveries: clientDeliveries.map(toPublicDeliveryDto) });
});

app.use((req, res) => apiError(res, 404, `Ruta no encontrada: ${req.method} ${req.path}`, 'NOT_FOUND'));

app.listen(PORT, () => {
  console.log(`FarmaTrack demo-server escuchando en puerto ${PORT}`);
});
