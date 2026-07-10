import type { User } from '#src/modules/user/domain/user.entity.js';
import type { Role } from '#src/shared/constant/roles.constant.js';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  distributionCenterId: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toUserDto(entity: User): UserDto {
  return {
    id: entity.id,
    email: entity.email,
    name: entity.name,
    role: entity.role,
    distributionCenterId: entity.distributionCenterId,
    active: entity.active,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
