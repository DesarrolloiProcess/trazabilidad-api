export interface ImportResultDto {
  routeId: string;
  routeCode: string;
  distributionCenterId: string;
  date: Date;
  deliveriesCount: number;
  trackingNumbers: string[];
}
