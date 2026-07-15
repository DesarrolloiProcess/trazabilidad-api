import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { clients, deliveries, distributionCenters, routes, users, newId } from './fixtures.js';

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'farmatrack-demo-secret-not-for-production';
const MOCK_PASSWORD = 'farmatrack123';

const routesStore = [...routes];
const deliveriesStore = [...deliveries];
const clientsStore = [...clients];

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
  const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());

  if (!user || !user.active || password !== MOCK_PASSWORD) {
    return apiError(res, 401, 'Credenciales inválidas', 'UNAUTHORIZED');
  }

  const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user });
});

app.post('/api/txt-import', auth, requireRole('ADMIN', 'CEDI'), (req, res) => {
  const { content, distributionCenterId } = req.body ?? {};
  const resolvedDistributionCenterId = distributionCenterId || req.user.distributionCenterId;

  if (!resolvedDistributionCenterId) {
    return apiError(
      res,
      422,
      req.user.role === 'ADMIN' ? 'Selecciona el CEDI destino de esta planilla' : 'El usuario que importa la planilla debe pertenecer a un CEDI',
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

    let client = clientsStore.find((c) => c.nit === first.clienteNit);
    if (!client) {
      client = { id: newId('client'), nit: first.clienteNit, name: first.destinatarioNombre, phone: first.destinatarioTelefono };
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
      observation: null,
      deliveredAt: null,
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

  const driver = users.find((u) => u.id === req.body?.driverId);
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

app.get('/api/distribution-centers', auth, (req, res) => {
  res.json(paginate(distributionCenters, req.query.page, req.query.limit));
});

app.get('/api/users', auth, (req, res) => {
  res.json(paginate(users.filter((u) => u.role === 'CONDUCTOR'), req.query.page, req.query.limit));
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
