import type { Role } from '#src/shared/constant/roles.constant.js';

export interface AuthenticatedUser {
  id: string;
  role: Role;
  distributionCenterId?: string;
}
