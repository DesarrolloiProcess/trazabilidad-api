import { randomUUID } from 'node:crypto';

function hashSeed(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

function svgToDataUri(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function signaturePlaceholder(seed) {
  const h = hashSeed(seed);
  const amp = 12 + (h % 10);
  const y0 = 55 + (h % 8);
  const path = `M 15 ${y0} Q 45 ${y0 - amp} 75 ${y0} T 135 ${y0} T 195 ${y0 - amp / 2}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="90" viewBox="0 0 220 90">
    <rect width="220" height="90" fill="#FAFAF8"/>
    <path d="${path}" fill="none" stroke="#101820" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
  return svgToDataUri(svg);
}

export function photoPlaceholder(trackingNumber) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220">
    <rect width="320" height="220" fill="#101820"/>
    <polygon points="160,60 210,85 210,135 160,160 110,135 110,85" fill="#FF5C39"/>
    <polygon points="160,85 185,97.5 185,122.5 160,135 135,122.5 135,97.5" fill="#FAFAF8"/>
    <text x="160" y="190" font-family="monospace" font-size="16" fill="#FAFAF8" text-anchor="middle">${trackingNumber}</text>
  </svg>`;
  return svgToDataUri(svg);
}

const iso = (daysOffset, hours = 8, minutes = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const distributionCenters = [
  {
    id: 'cedi-bogota-norte',
    name: 'Droguería Bogotá Norte',
    city: 'Bogotá',
    address: 'Autopista Norte # 145-30, Local 4',
    active: true,
    createdAt: iso(-120),
    updatedAt: iso(-10),
  },
  {
    id: 'cedi-medellin',
    name: 'Droguería Medellín',
    city: 'Medellín',
    address: 'Cra 65 # 42-15, Guayabal',
    active: true,
    createdAt: iso(-100),
    updatedAt: iso(-8),
  },
  {
    id: 'cedi-cali',
    name: 'Droguería Cali',
    city: 'Cali',
    address: 'Calle 25 # 95-20, Yumbo',
    active: true,
    createdAt: iso(-90),
    updatedAt: iso(-5),
  },
  {
    id: 'cedi-barranquilla',
    name: 'Droguería Barranquilla',
    city: 'Barranquilla',
    address: 'Vía 40 # 76-45',
    active: false,
    createdAt: iso(-15),
    updatedAt: iso(-2),
  },
];

export const users = [
  {
    id: 'user-admin-1',
    email: 'admin@iprocess.co',
    name: 'Anamaría Ángel',
    role: 'ADMIN',
    distributionCenterId: null,
    active: true,
    createdAt: iso(-200),
    updatedAt: iso(-200),
  },
  {
    id: 'user-cedi-bogota',
    email: 'maria.rodriguez@farmatrack.co',
    name: 'María Rodríguez',
    role: 'CEDI',
    distributionCenterId: 'cedi-bogota-norte',
    active: true,
    createdAt: iso(-110),
    updatedAt: iso(-110),
  },
  {
    id: 'user-cedi-medellin',
    email: 'jorge.silva@farmatrack.co',
    name: 'Jorge Silva',
    role: 'CEDI',
    distributionCenterId: 'cedi-medellin',
    active: true,
    createdAt: iso(-95),
    updatedAt: iso(-95),
  },
  {
    id: 'driver-1',
    email: 'carlos.pena@farmatrack.co',
    name: 'Carlos Peña',
    role: 'CONDUCTOR',
    distributionCenterId: 'cedi-bogota-norte',
    active: true,
    createdAt: iso(-80),
    updatedAt: iso(-80),
  },
  {
    id: 'driver-2',
    email: 'ana.ruiz@farmatrack.co',
    name: 'Ana Ruiz',
    role: 'CONDUCTOR',
    distributionCenterId: 'cedi-medellin',
    active: true,
    createdAt: iso(-75),
    updatedAt: iso(-75),
  },
  {
    id: 'driver-3',
    email: 'transurb@farmatrack.co',
    name: 'TransUrb (tercero)',
    role: 'CONDUCTOR',
    distributionCenterId: 'cedi-cali',
    active: true,
    createdAt: iso(-60),
    updatedAt: iso(-60),
  },
  {
    id: 'driver-4',
    email: 'luis.moreno@farmatrack.co',
    name: 'Luis Moreno',
    role: 'CONDUCTOR',
    distributionCenterId: 'cedi-bogota-norte',
    active: true,
    createdAt: iso(-40),
    updatedAt: iso(-40),
  },
];

// El "cliente" es el convenio/EPS que paga la entrega (facturación), no quien la recibe — eso es el paciente,
// ver recipientName/recipientPhone en cada seed de delivery. 'client-particular' agrupa a los pacientes sin
// convenio (pago particular), igual que hace el backend real cuando clienteNit llega vacío.
export const clients = [
  { id: 'client-1', nit: '900123456', name: 'EPS Sura', phone: '' },
  { id: 'client-2', nit: '900234567', name: 'Nueva EPS', phone: '' },
  { id: 'client-3', nit: '900345678', name: 'EPS Sanitas', phone: '' },
  { id: 'client-4', nit: '900456789', name: 'Compensar EPS', phone: '' },
  { id: 'client-5', nit: '900567890', name: 'EPS Salud Total', phone: '' },
  { id: 'client-6', nit: '900678901', name: 'Famisanar EPS', phone: '' },
  { id: 'client-7', nit: '900789012', name: 'Coosalud EPS', phone: '' },
  { id: 'client-8', nit: '900890123', name: 'Aliansalud EPS', phone: '' },
  { id: 'client-particular', nit: '', name: 'Particular', phone: '' },
];

export const routes = [
  {
    id: 'route-r014',
    code: 'R-014',
    distributionCenterId: 'cedi-bogota-norte',
    driverId: 'driver-1',
    date: iso(0),
    status: 'en_curso',
    createdAt: iso(0, 6),
    updatedAt: iso(0, 9, 40),
  },
  {
    id: 'route-r015',
    code: 'R-015',
    distributionCenterId: 'cedi-bogota-norte',
    driverId: null,
    date: iso(0),
    status: 'creada',
    createdAt: iso(0, 6, 30),
    updatedAt: iso(0, 6, 30),
  },
  {
    id: 'route-r011',
    code: 'R-011',
    distributionCenterId: 'cedi-medellin',
    driverId: 'driver-2',
    date: iso(-1),
    status: 'completada',
    createdAt: iso(-1, 6),
    updatedAt: iso(-1, 17),
  },
  {
    id: 'route-r009',
    code: 'R-009',
    distributionCenterId: 'cedi-cali',
    driverId: 'driver-3',
    date: iso(-1),
    status: 'con_novedad',
    createdAt: iso(-1, 6),
    updatedAt: iso(-1, 14),
  },
  {
    id: 'route-r016',
    code: 'R-016',
    distributionCenterId: 'cedi-bogota-norte',
    driverId: 'driver-4',
    date: iso(0),
    status: 'entregada_transportador',
    createdAt: iso(0, 7),
    updatedAt: iso(0, 8),
  },
  {
    id: 'route-r017',
    code: 'R-017',
    distributionCenterId: 'cedi-bogota-norte',
    driverId: null,
    date: iso(0),
    status: 'creada',
    createdAt: iso(0, 7, 30),
    updatedAt: iso(0, 7, 30),
  },
];

const seeds = [
  {
    id: 'del-00227',
    routeId: 'route-r014',
    clientId: 'client-5',
    trackingNumber: 'FARMA-00227',
    address: 'Cll 100 # 19-30, Apto 301, Bogotá',
    recipientName: 'Rosa Elena Martínez',
    recipientPhone: '3101234567',
    status: 'no_entregado',
    products: [{ code: 'MED-3301', description: 'Suero fisiológico 500ml x12', quantity: 2, price: 48000 }],
    deliveredAt: iso(-1, 15, 10),
    observation: 'No había nadie en casa, reprogramar entrega para mañana en la mañana.',
    destination: { lat: 4.6903, lng: -74.0396 },
  },
  {
    id: 'del-00228',
    routeId: 'route-r014',
    clientId: 'client-4',
    trackingNumber: 'FARMA-00228',
    address: 'Cra 15 # 72-30, Apto 802, Bogotá',
    recipientName: 'Andrés Felipe Rojas',
    recipientPhone: '3112345678',
    status: 'alistado',
    products: [{ code: 'MED-1105', description: 'Ibuprofeno 400mg x30', quantity: 5, price: 12500 }],
    deliveredAt: null,
    destination: { lat: 4.658, lng: -74.0559 },
  },
  {
    id: 'del-00229',
    routeId: 'route-r014',
    clientId: 'client-3',
    trackingNumber: 'FARMA-00229',
    address: 'Av 19 # 114-05, Casa 12, Bogotá',
    recipientName: 'Diana Torres',
    recipientPhone: '3157654321',
    status: 'entregado_cliente',
    products: [
      { code: 'MED-2210', description: 'Losartán 50mg x30', quantity: 3, price: 9800 },
      { code: 'MED-2215', description: 'Metformina 850mg x30', quantity: 2, price: 8600 },
    ],
    deliveredAt: iso(0, 8, 52),
    destination: { lat: 4.6971, lng: -74.0426 },
    evidence: { receiverName: 'Diana Torres', receiverIdNumber: '52340981', latitude: 4.6971, longitude: -74.0426 },
  },
  {
    id: 'del-00230',
    routeId: 'route-r014',
    clientId: 'client-2',
    trackingNumber: 'FARMA-00230',
    address: 'Cll 80 # 12-40, Apto 604, Bogotá',
    recipientName: 'Julián Peña',
    recipientPhone: '3022345678',
    status: 'entregado_cliente',
    products: [
      { code: 'MED-4410', description: 'Metformina 850mg x30', quantity: 3, price: 8600 },
      { code: 'MED-4415', description: 'Insulina glargina', quantity: 1, price: 92000 },
    ],
    deliveredAt: iso(0, 9, 12),
    destination: { lat: 4.685, lng: -74.055 },
    evidence: { receiverName: 'Julián Peña', receiverIdNumber: '80456123', latitude: 4.685, longitude: -74.055 },
  },
  {
    id: 'del-00231',
    routeId: 'route-r014',
    clientId: 'client-1',
    trackingNumber: 'FARMA-00231',
    address: 'Cra 45 # 103-22, Casa, Bogotá',
    recipientName: 'Marcela Ibarra Suárez',
    recipientPhone: '3134455667',
    status: 'entregado_transportador',
    products: [
      { code: 'MED-1042', description: 'Amoxicilina 500mg x21', quantity: 2, price: 15400 },
      { code: 'MED-1050', description: 'Losartán 50mg x30', quantity: 1, price: 9800 },
    ],
    deliveredAt: null,
    destination: { lat: 4.695, lng: -74.045 },
  },
  {
    id: 'del-00232',
    routeId: 'route-r016',
    clientId: 'client-particular',
    trackingNumber: 'FARMA-00232',
    address: 'Cra 76 # 34-10, Apto 201, Bogotá',
    recipientName: 'Jorge Enrique Salazar',
    recipientPhone: '3145566778',
    status: 'creado',
    products: [{ code: 'MED-5510', description: 'Acetaminofén 500mg x20', quantity: 10, price: 4200 }],
    deliveredAt: null,
    destination: { lat: 4.635, lng: -74.11 },
  },
  {
    id: 'del-00201',
    routeId: 'route-r011',
    clientId: 'client-6',
    trackingNumber: 'FARMA-00201',
    address: 'Cra 70 # 44-30, Apto 1102, Medellín (El Poblado)',
    recipientName: 'Camilo Zea',
    recipientPhone: '3066789012',
    status: 'entregado_cliente',
    products: [{ code: 'MED-6601', description: 'Salbutamol inhalador', quantity: 4, price: 21500 }],
    deliveredAt: iso(-1, 10, 5),
    invoiced: true,
    destination: { lat: 6.2088, lng: -75.5701 },
    evidence: { receiverName: 'Camilo Zea', receiverIdNumber: '1128459023', latitude: 6.2088, longitude: -75.5701 },
  },
  {
    id: 'del-00202',
    routeId: 'route-r011',
    clientId: 'client-6',
    trackingNumber: 'FARMA-00202',
    address: 'Cll 30 # 65-12, Casa 8, Medellín',
    recipientName: 'Sara Gómez',
    recipientPhone: '3178899001',
    status: 'entregado_cliente',
    products: [{ code: 'MED-6602', description: 'Omeprazol 20mg x14', quantity: 6, price: 7300 }],
    deliveredAt: iso(-1, 11, 40),
    destination: { lat: 6.244, lng: -75.573 },
    evidence: { receiverName: 'Sara Gómez', receiverIdNumber: '43876521', latitude: 6.244, longitude: -75.573 },
  },
  {
    id: 'del-00150',
    routeId: 'route-r009',
    clientId: 'client-7',
    trackingNumber: 'FARMA-00150',
    address: 'Cll 5 # 38-25, Apto 405, Cali',
    recipientName: 'Luis Fernando Bedoya',
    recipientPhone: '3167788990',
    status: 'no_entregado',
    products: [{ code: 'MED-7701', description: 'Vacuna influenza (caja x10)', quantity: 1, price: 185000 }],
    deliveredAt: iso(-1, 13, 55),
    observation: 'No había persona autorizada para recibir producto de cadena de frío. Reprogramado.',
    destination: { lat: 3.4372, lng: -76.5225 },
  },
  {
    id: 'del-00151',
    routeId: 'route-r009',
    clientId: 'client-7',
    trackingNumber: 'FARMA-00151',
    address: 'Av 6N # 24-10, Casa, Cali',
    recipientName: 'Patricia Elena Vidal',
    recipientPhone: '3178899002',
    status: 'entregado_transportador',
    products: [{ code: 'MED-7702', description: 'Ibuprofeno 400mg x30', quantity: 8, price: 12500 }],
    deliveredAt: null,
    destination: { lat: 3.465, lng: -76.53 },
  },
  {
    id: 'del-00233',
    routeId: 'route-r016',
    clientId: 'client-particular',
    trackingNumber: 'FARMA-00233',
    address: 'Cra 68 # 30-15, Apto 103, Bogotá (Kennedy)',
    recipientName: 'Nelson Iván Castro',
    recipientPhone: '3189900112',
    status: 'entregado_transportador',
    products: [{ code: 'MED-8801', description: 'Loratadina 10mg x10', quantity: 12, price: 3900 }],
    deliveredAt: null,
    destination: { lat: 4.628, lng: -74.145 },
  },
  {
    id: 'del-00234',
    routeId: 'route-r016',
    clientId: 'client-4',
    trackingNumber: 'FARMA-00234',
    address: 'Cra 15 # 72-30, Apto 802, Bogotá',
    recipientName: 'Ana Lucía Restrepo',
    recipientPhone: '3044567890',
    status: 'entregado_cliente',
    products: [{ code: 'MED-1105', description: 'Ibuprofeno 400mg x30', quantity: 4, price: 12500 }],
    deliveredAt: iso(0, 8, 15),
    destination: { lat: 4.658, lng: -74.0559 },
    evidence: { receiverName: 'Ana Lucía Restrepo', receiverIdNumber: '79045612', latitude: 4.658, longitude: -74.093 },
  },
  {
    id: 'del-00301',
    routeId: 'route-r017',
    clientId: 'client-particular',
    trackingNumber: 'FARMA-00301',
    address: 'Cll 100 # 19-30, Apto 205, Bogotá',
    recipientName: 'Camilo Andrés Duarte',
    recipientPhone: '3191122334',
    status: 'creado',
    products: [{ code: 'MED-9001', description: 'Vacuna hepatitis B (caja x5)', quantity: 1, price: 95000 }],
    deliveredAt: null,
    destination: { lat: 4.6903, lng: -74.0396 },
  },
  {
    id: 'del-00302',
    routeId: 'route-r017',
    clientId: 'client-2',
    trackingNumber: 'FARMA-00302',
    address: 'Cll 80 # 12-40, Apto 604, Bogotá',
    recipientName: 'Valentina Ríos',
    recipientPhone: '3202233445',
    status: 'creado',
    products: [{ code: 'MED-9002', description: 'Amoxicilina 500mg x21', quantity: 6, price: 15400 }],
    deliveredAt: null,
    destination: { lat: 4.685, lng: -74.055 },
  },
];

export function findClientById(clientId) {
  const client = clients.find((c) => c.id === clientId);
  if (!client) throw new Error(`Cliente mock no encontrado: ${clientId}`);
  return client;
}

export const deliveries = seeds.map((seed) => ({
  id: seed.id,
  routeId: seed.routeId,
  clientId: seed.clientId,
  trackingNumber: seed.trackingNumber,
  address: seed.address,
  recipientName: seed.recipientName,
  recipientPhone: seed.recipientPhone,
  products: seed.products,
  status: seed.status,
  signatureUrl: seed.evidence ? signaturePlaceholder(seed.trackingNumber) : null,
  photoUrl: seed.evidence ? photoPlaceholder(seed.trackingNumber) : null,
  receiverName: seed.evidence?.receiverName ?? null,
  receiverIdNumber: seed.evidence?.receiverIdNumber ?? null,
  latitude: seed.evidence?.latitude ?? null,
  longitude: seed.evidence?.longitude ?? null,
  destinationLatitude: seed.destination.lat,
  destinationLongitude: seed.destination.lng,
  observation: seed.observation ?? null,
  deliveredAt: seed.deliveredAt,
  invoiced: seed.invoiced ?? false,
  invoicedAt: seed.invoiced ? seed.deliveredAt : null,
  createdAt: iso(-1, 6),
  updatedAt: seed.deliveredAt ?? iso(-1, 6),
}));

export function newId(prefix) {
  return `${prefix}-${randomUUID()}`;
}
