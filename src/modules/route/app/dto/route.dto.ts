import type { Route, RouteStatus } from '#src/modules/route/domain/route.entity.js';

export interface RouteDto {
  id: string;
  distributionCenterId: string;
  driverId: string;
  date: Date;
  status: RouteStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function toRouteDto(entity: Route): RouteDto {
  return {
    id: entity.id,
    distributionCenterId: entity.distributionCenterId,
    driverId: entity.driverId,
    date: entity.date,
    status: entity.status,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
