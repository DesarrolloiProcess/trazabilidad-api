import type { AuthenticatedUser } from '#src/shared/commands/authenticatedUser.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
