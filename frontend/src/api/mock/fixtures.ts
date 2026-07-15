import type {
  DeliveryDto,
  DeliveryStatus,
  DistributionCenterDto,
  RouteDto,
  RouteStatus,
  UserDto,
} from '#src/api/types';

interface MockClient {
  id: string;
  nit: string;
  name: string;
  phone: string;
}

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Firma placeholder: un trazo tipo firma manuscrita, ligeramente distinto por seed. */
export function signaturePlaceholder(seed: string): string {
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

/** Foto placeholder: rectángulo de marca con el número de guía, en vez de una URL rota. */
export function photoPlaceholder(trackingNumber: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220">
    <rect width="320" height="220" fill="#101820"/>
    <polygon points="160,60 210,85 210,135 160,160 110,135 110,85" fill="#FF5C39"/>
    <polygon points="160,85 185,97.5 185,122.5 160,135 135,122.5 135,97.5" fill="#FAFAF8"/>
    <text x="160" y="190" font-family="monospace" font-size="16" fill="#FAFAF8" text-anchor="middle">${trackingNumber}</text>
  </svg>`;
  return svgToDataUri(svg);
}

const iso = (daysOffset: number, hours = 8, minutes = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const distributionCenters: DistributionCenterDto[] = [
  {
    id: 'cedi-bogota-norte',
    name: 'CEDI Bogotá Norte',
    city: 'Bogotá',
    address: 'Autopista Norte # 145-30, Bodega 4',
    active: true,
    createdAt: iso(-120),
    updatedAt: iso(-10),
  },
  {
    id: 'cedi-medellin',
    name: 'CEDI Medellín',
    city: 'Medellín',
    address: 'Cra 65 # 42-15, Guayabal',
    active: true,
    createdAt: iso(-100),
    updatedAt: iso(-8),
  },
  {
    id: 'cedi-cali',
    name: 'CEDI Cali',
    city: 'Cali',
    address: 'Calle 25 # 95-20, Yumbo',
    active: true,
    createdAt: iso(-90),
    updatedAt: iso(-5),
  },
  {
    id: 'cedi-barranquilla',
    name: 'CEDI Barranquilla',
    city: 'Barranquilla',
    address: 'Vía 40 # 76-45',
    active: false,
    createdAt: iso(-15),
    updatedAt: iso(-2),
  },
];

export const users: UserDto[] = [
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

export const clients: MockClient[] = [
  { id: 'client-1', nit: '900123456', name: 'Farmacia San Rafael', phone: '3011234567' },
  { id: 'client-2', nit: '900234567', name: 'Droguería El Roble', phone: '3022345678' },
  { id: 'client-3', nit: '900345678', name: 'Punto Salud Norte', phone: '3033456789' },
  { id: 'client-4', nit: '900456789', name: 'Farmacia Central', phone: '3044567890' },
  { id: 'client-5', nit: '900567890', name: 'Hospital del Norte', phone: '3055678901' },
  { id: 'client-6', nit: '900678901', name: 'Droguería La Rebaja Poblado', phone: '3066789012' },
  { id: 'client-7', nit: '900789012', name: 'EPS Salud Total Cali', phone: '3077890123' },
  { id: 'client-8', nit: '900890123', name: 'Farmacia Comunitaria Kennedy', phone: '3088901234' },
];

export const routes: RouteDto[] = [
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

interface DeliverySeed {
  id: string;
  routeId: string;
  clientId: string;
  trackingNumber: string;
  address: string;
  status: DeliveryStatus;
  products: DeliveryDto['products'];
  deliveredAt: string | null;
  observation?: string;
  evidence?: {
    signatureUrl: string;
    photoUrl: string;
    receiverName: string;
    receiverIdNumber: string;
    latitude: number;
    longitude: number;
  };
}

const seeds: DeliverySeed[] = [
  {
    id: 'del-00227',
    routeId: 'route-r014',
    clientId: 'client-5',
    trackingNumber: 'FARMA-00227',
    address: 'Cll 100 # 19-30, Bogotá',
    status: 'no_entregado',
    products: [{ code: 'MED-3301', description: 'Suero fisiológico 500ml x12', quantity: 2, price: 48000 }],
    deliveredAt: iso(-1, 15, 10),
    observation: 'Punto cerrado, reprogramar entrega para mañana en la mañana.',
  },
  {
    id: 'del-00228',
    routeId: 'route-r014',
    clientId: 'client-4',
    trackingNumber: 'FARMA-00228',
    address: 'Cra 15 # 72-30, Bogotá',
    status: 'alistado',
    products: [{ code: 'MED-1105', description: 'Ibuprofeno 400mg x30', quantity: 5, price: 12500 }],
    deliveredAt: null,
  },
  {
    id: 'del-00229',
    routeId: 'route-r014',
    clientId: 'client-3',
    trackingNumber: 'FARMA-00229',
    address: 'Av 19 # 114-05, Bogotá',
    status: 'entregado_cliente',
    products: [
      { code: 'MED-2210', description: 'Losartán 50mg x30', quantity: 3, price: 9800 },
      { code: 'MED-2215', description: 'Metformina 850mg x30', quantity: 2, price: 8600 },
    ],
    deliveredAt: iso(0, 8, 52),
    evidence: {
      signatureUrl: signaturePlaceholder('FARMA-00229'),
      photoUrl: photoPlaceholder('FARMA-00229'),
      receiverName: 'Diana Torres',
      receiverIdNumber: '52340981',
      latitude: 4.6971,
      longitude: -74.0426,
    },
  },
  {
    id: 'del-00230',
    routeId: 'route-r014',
    clientId: 'client-2',
    trackingNumber: 'FARMA-00230',
    address: 'Cll 80 # 12-40, Bogotá',
    status: 'entregado_cliente',
    products: [
      { code: 'MED-4410', description: 'Metformina 850mg x30', quantity: 3, price: 8600 },
      { code: 'MED-4415', description: 'Insulina glargina', quantity: 1, price: 92000 },
    ],
    deliveredAt: iso(0, 9, 12),
    evidence: {
      signatureUrl: signaturePlaceholder('FARMA-00230'),
      photoUrl: photoPlaceholder('FARMA-00230'),
      receiverName: 'Julián Peña',
      receiverIdNumber: '80456123',
      latitude: 4.685,
      longitude: -74.055,
    },
  },
  {
    id: 'del-00231',
    routeId: 'route-r014',
    clientId: 'client-1',
    trackingNumber: 'FARMA-00231',
    address: 'Cra 45 # 103-22, Bogotá',
    status: 'entregado_transportador',
    products: [
      { code: 'MED-1042', description: 'Amoxicilina 500mg x21', quantity: 2, price: 15400 },
      { code: 'MED-1050', description: 'Losartán 50mg x30', quantity: 1, price: 9800 },
    ],
    deliveredAt: null,
  },
  {
    id: 'del-00232',
    routeId: 'route-r016',
    clientId: 'client-6',
    trackingNumber: 'FARMA-00232',
    address: 'Cra 76 # 34-10, Bogotá',
    status: 'creado',
    products: [{ code: 'MED-5510', description: 'Acetaminofén 500mg x20', quantity: 10, price: 4200 }],
    deliveredAt: null,
  },
  {
    id: 'del-00201',
    routeId: 'route-r011',
    clientId: 'client-6',
    trackingNumber: 'FARMA-00201',
    address: 'Cra 70 # 44-30, Medellín (El Poblado)',
    status: 'entregado_cliente',
    products: [{ code: 'MED-6601', description: 'Salbutamol inhalador', quantity: 4, price: 21500 }],
    deliveredAt: iso(-1, 10, 5),
    evidence: {
      signatureUrl: signaturePlaceholder('FARMA-00201'),
      photoUrl: photoPlaceholder('FARMA-00201'),
      receiverName: 'Camilo Zea',
      receiverIdNumber: '1128459023',
      latitude: 6.2088,
      longitude: -75.5701,
    },
  },
  {
    id: 'del-00202',
    routeId: 'route-r011',
    clientId: 'client-6',
    trackingNumber: 'FARMA-00202',
    address: 'Cll 30 # 65-12, Medellín',
    status: 'entregado_cliente',
    products: [{ code: 'MED-6602', description: 'Omeprazol 20mg x14', quantity: 6, price: 7300 }],
    deliveredAt: iso(-1, 11, 40),
    evidence: {
      signatureUrl: signaturePlaceholder('FARMA-00202'),
      photoUrl: photoPlaceholder('FARMA-00202'),
      receiverName: 'Sara Gómez',
      receiverIdNumber: '43876521',
      latitude: 6.244,
      longitude: -75.573,
    },
  },
  {
    id: 'del-00150',
    routeId: 'route-r009',
    clientId: 'client-7',
    trackingNumber: 'FARMA-00150',
    address: 'Cll 5 # 38-25, Cali',
    status: 'no_entregado',
    products: [{ code: 'MED-7701', description: 'Vacuna influenza (caja x10)', quantity: 1, price: 185000 }],
    deliveredAt: iso(-1, 13, 55),
    observation: 'No había persona autorizada para recibir producto de cadena de frío. Reprogramado.',
  },
  {
    id: 'del-00151',
    routeId: 'route-r009',
    clientId: 'client-7',
    trackingNumber: 'FARMA-00151',
    address: 'Av 6N # 24-10, Cali',
    status: 'entregado_transportador',
    products: [{ code: 'MED-7702', description: 'Ibuprofeno 400mg x30', quantity: 8, price: 12500 }],
    deliveredAt: null,
  },
  {
    id: 'del-00233',
    routeId: 'route-r016',
    clientId: 'client-8',
    trackingNumber: 'FARMA-00233',
    address: 'Cra 68 # 30-15, Bogotá (Kennedy)',
    status: 'entregado_transportador',
    products: [{ code: 'MED-8801', description: 'Loratadina 10mg x10', quantity: 12, price: 3900 }],
    deliveredAt: null,
  },
  {
    id: 'del-00234',
    routeId: 'route-r016',
    clientId: 'client-4',
    trackingNumber: 'FARMA-00234',
    address: 'Cra 15 # 72-30, Bogotá',
    status: 'entregado_cliente',
    products: [{ code: 'MED-1105', description: 'Ibuprofeno 400mg x30', quantity: 4, price: 12500 }],
    deliveredAt: iso(0, 8, 15),
    evidence: {
      signatureUrl: signaturePlaceholder('FARMA-00234'),
      photoUrl: photoPlaceholder('FARMA-00234'),
      receiverName: 'Farmacia Central - Recepción',
      receiverIdNumber: '79045612',
      latitude: 4.658,
      longitude: -74.093,
    },
  },
  {
    id: 'del-00301',
    routeId: 'route-r017',
    clientId: 'client-5',
    trackingNumber: 'FARMA-00301',
    address: 'Cll 100 # 19-30, Bogotá',
    status: 'creado',
    products: [{ code: 'MED-9001', description: 'Vacuna hepatitis B (caja x5)', quantity: 1, price: 95000 }],
    deliveredAt: null,
  },
  {
    id: 'del-00302',
    routeId: 'route-r017',
    clientId: 'client-2',
    trackingNumber: 'FARMA-00302',
    address: 'Cll 80 # 12-40, Bogotá',
    status: 'creado',
    products: [{ code: 'MED-9002', description: 'Amoxicilina 500mg x21', quantity: 6, price: 15400 }],
    deliveredAt: null,
  },
];

export const deliveries: DeliveryDto[] = seeds.map((seed) => ({
  id: seed.id,
  routeId: seed.routeId,
  clientId: seed.clientId,
  trackingNumber: seed.trackingNumber,
  address: seed.address,
  recipientName: clients.find((c) => c.id === seed.clientId)!.name,
  recipientPhone: clients.find((c) => c.id === seed.clientId)!.phone,
  products: seed.products,
  status: seed.status,
  signatureUrl: seed.evidence?.signatureUrl ?? null,
  photoUrl: seed.evidence?.photoUrl ?? null,
  receiverName: seed.evidence?.receiverName ?? null,
  receiverIdNumber: seed.evidence?.receiverIdNumber ?? null,
  latitude: seed.evidence?.latitude ?? null,
  longitude: seed.evidence?.longitude ?? null,
  observation: seed.observation ?? null,
  deliveredAt: seed.deliveredAt,
  createdAt: iso(-1, 6),
  updatedAt: seed.deliveredAt ?? iso(-1, 6),
}));

export function findClientById(clientId: string): MockClient {
  const client = clients.find((c) => c.id === clientId);
  if (!client) throw new Error(`Cliente mock no encontrado: ${clientId}`);
  return client;
}

export const routeStatusValues: RouteStatus[] = ['creada', 'entregada_transportador', 'en_curso', 'completada', 'con_novedad'];
