import type { DistributionCenter } from '#src/modules/distributionCenter/domain/distributionCenter.entity.js';

export interface DistributionCenterDto {
  id: string;
  name: string;
  city: string;
  address: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toDistributionCenterDto(entity: DistributionCenter): DistributionCenterDto {
  return {
    id: entity.id,
    name: entity.name,
    city: entity.city,
    address: entity.address,
    active: entity.active,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
