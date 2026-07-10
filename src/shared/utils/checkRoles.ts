import type { Role } from '#src/shared/constant/roles.constant.js';

export function checkRoles(userRole: Role, allowedRoles: Role[]): boolean {
  if (allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
}
