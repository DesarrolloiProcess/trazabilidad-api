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

  importTxtPlanilla(content: string): Promise<ImportResultDto>;

  listRoutes(params: ListRoutesParams): Promise<PagedResult<RouteDto>>;
  getRouteById(id: string): Promise<RouteDto>;
  assignDriver(routeId: string, driverId: string): Promise<RouteDto>;
  updateRouteStatus(routeId: string, status: RouteStatus): Promise<RouteDto>;

  listDeliveries(params: ListDeliveriesParams): Promise<PagedResult<DeliveryDto>>;
  getDeliveryById(id: string): Promise<DeliveryDto>;
  advanceDeliveryStatus(id: string, status: DeliveryStatus): Promise<DeliveryDto>;
  submitDeliveryEvidence(id: string, data: DeliveryEvidenceInput): Promise<DeliveryDto>;
  markNotDelivered(id: string, observation: string): Promise<DeliveryDto>;

  listDistributionCenters(): Promise<DistributionCenterDto[]>;
  listDrivers(): Promise<UserDto[]>;

  trackDelivery(trackingNumber: string, verificationValue: string): Promise<PublicDeliveryDto>;
  listMyDeliveries(trackingNumber: string, verificationValue: string): Promise<MyDeliveriesDto>;
}
