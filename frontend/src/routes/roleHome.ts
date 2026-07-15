import type { Role } from '#src/api/types';

const ROLE_HOME: Record<Role, string> = {
  ADMIN: '/panel',
  CEDI: '/cdi',
  CONDUCTOR: '/conductor',
};

export function roleHome(role: Role): string {
  return ROLE_HOME[role];
}
