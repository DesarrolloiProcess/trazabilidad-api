export type Role = 'ADMIN' | 'CEDI' | 'CONDUCTOR';

export type DeliveryStatus =
  | 'creado'
  | 'alistado'
  | 'entregado_transportador'
  | 'entregado_cliente'
  | 'no_entregado';

export type RouteStatus = 'creada' | 'entregada_transportador' | 'en_curso' | 'completada' | 'con_novedad';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  distributionCenterId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResultDto {
  token: string;
  user: UserDto;
}

export interface DistributionCenterDto {
  id: string;
  name: string;
  city: string;
  address: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryProduct {
  code: string;
  description: string;
  quantity: number;
  price: number;
}

export interface DeliveryDto {
  id: string;
  routeId: string;
  clientId: string;
  trackingNumber: string;
  address: string;
  recipientName: string;
  recipientPhone: string;
  products: DeliveryProduct[];
  status: DeliveryStatus;
  signatureUrl: string | null;
  photoUrl: string | null;
  receiverName: string | null;
  receiverIdNumber: string | null;
  latitude: number | null;
  longitude: number | null;
  observation: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RouteDto {
  id: string;
  code: string;
  distributionCenterId: string;
  driverId: string | null;
  date: string;
  status: RouteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ImportResultDto {
  routeId: string;
  routeCode: string;
  distributionCenterId: string;
  date: string;
  deliveriesCount: number;
  trackingNumbers: string[];
}

export interface PublicDeliveryProduct {
  code: string;
  description: string;
  quantity: number;
}

export interface PublicDeliveryDto {
  trackingNumber: string;
  status: DeliveryStatus;
  address: string;
  recipientName: string;
  products: PublicDeliveryProduct[];
  deliveredAt: string | null;
}

export interface ClientSummaryDto {
  nit: string;
  name: string;
}

export interface MyDeliveriesDto {
  client: ClientSummaryDto;
  deliveries: PublicDeliveryDto[];
}

export interface PagedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DeliveryEvidenceInput {
  signatureUrl: string;
  photoUrl: string;
  receiverName: string;
  receiverIdNumber: string;
  latitude: number;
  longitude: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
