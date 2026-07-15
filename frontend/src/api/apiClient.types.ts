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

export interface ListDeliveriesParams {
  page?: number;
  limit?: number;
  routeId?: string;
}

export interface ListRoutesParams {
  page?: number;
  limit?: number;
  distributionCenterId?: string;
  driverId?: string;
}

/**
 * Contrato único de acceso al backend. Hoy lo implementa el mock (src/api/mock);
 * el día que la base de datos esté conectada, se cambia únicamente la
 * implementación exportada en src/api/client.ts — ningún componente lo sabe.
 */
export interface ApiClient {
  login(email: string, password: string): Promise<LoginResultDto>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  requestPasswordResetOtp(email: string): Promise<RequestOtpResultDto>;
  resetPasswordWithOtp(email: string, otpCode: string, newPassword: string): Promise<void>;

  importTxtPlanilla(content: string, distributionCenterId?: string): Promise<ImportResultDto>;

  listRoutes(params: ListRoutesParams): Promise<PagedResult<RouteDto>>;
  getRouteById(id: string): Promise<RouteDto>;
  assignDriver(routeId: string, driverId: string): Promise<RouteDto>;
  updateRouteStatus(routeId: string, status: RouteStatus): Promise<RouteDto>;

  /** Rutas de un CEDI con al menos una entrega en estado 'creado' pendiente por verificar (perfil CDI móvil). */
  listPendingVerification(distributionCenterId: string): Promise<PendingVerificationDto[]>;
  /** Verifica la planilla completa: avanza todas sus entregas 'creado' a 'alistado'. */
  verifyRoute(routeId: string): Promise<DeliveryDto[]>;

  listDeliveries(params: ListDeliveriesParams): Promise<PagedResult<DeliveryDto>>;
  getDeliveryById(id: string): Promise<DeliveryDto>;
  advanceDeliveryStatus(id: string, status: DeliveryStatus): Promise<DeliveryDto>;
  submitDeliveryEvidence(id: string, data: DeliveryEvidenceInput): Promise<DeliveryDto>;
  markNotDelivered(id: string, observation: string): Promise<DeliveryDto>;
  /** Marca la entrega como exportada a facturación (requiere estado 'entregado_cliente'). */
  exportInvoice(id: string): Promise<DeliveryDto>;

  listDistributionCenters(): Promise<DistributionCenterDto[]>;
  createDistributionCenter(input: CreateDistributionCenterInput): Promise<DistributionCenterDto>;
  updateDistributionCenter(id: string, input: UpdateDistributionCenterInput): Promise<DistributionCenterDto>;

  /** Conductores activos (para asignar rutas) — subconjunto de listUsers. */
  listDrivers(): Promise<UserDto[]>;
  /** Todos los usuarios, cualquier rol (gestión de usuarios, ADMIN). */
  listUsers(): Promise<UserDto[]>;
  createUser(input: CreateUserInput): Promise<UserDto>;
  updateUser(id: string, input: UpdateUserInput): Promise<UserDto>;

  trackDelivery(trackingNumber: string, verificationValue: string): Promise<PublicDeliveryDto>;
  listMyDeliveries(trackingNumber: string, verificationValue: string): Promise<MyDeliveriesDto>;
}
