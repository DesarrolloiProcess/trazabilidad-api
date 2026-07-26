export type Role = 'ADMIN' | 'CEDI' | 'CONDUCTOR';

export type DeliveryStatus =
  | 'creado'
  | 'alistado'
  | 'entregado_transportador'
  | 'entregado_cliente'
  | 'no_entregado';

export type RouteStatus = 'creada' | 'asignada' | 'entregada_transportador' | 'en_curso' | 'completada' | 'con_novedad';

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
  /** Coordenadas del punto de destino (conocidas desde la importación), para el mapa de rutas — distintas de latitude/longitude, que son la geolocalización capturada como evidencia al confirmar la entrega. */
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  observation: string | null;
  deliveredAt: string | null;
  invoiced: boolean;
  invoicedAt: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: DeliveryStatusHistoryEntry[];
}

export interface DeliveryStatusHistoryEntry {
  status: DeliveryStatus;
  changedAt: string;
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
  signatureUrl: string | null;
  photoUrl: string | null;
  receiverName: string | null;
  receiverIdNumber: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface PendingVerificationDto {
  route: RouteDto;
  deliveries: DeliveryDto[];
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

export interface CreateUserInput {
  email: string;
  name: string;
  role: Role;
  distributionCenterId: string | null;
}

export interface UpdateUserInput {
  name?: string;
  role?: Role;
  distributionCenterId?: string | null;
  active?: boolean;
}

export interface CreateDistributionCenterInput {
  name: string;
  city: string;
  address: string;
}

export interface UpdateDistributionCenterInput {
  name?: string;
  city?: string;
  address?: string;
  active?: boolean;
}

export interface RequestOtpResultDto {
  /** En el mock/demo el código se devuelve directo (no hay proveedor real de SMS/email). */
  otpCode: string;
  expiresAt: string;
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
