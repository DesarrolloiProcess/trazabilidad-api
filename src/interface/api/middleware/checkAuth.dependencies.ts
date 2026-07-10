import { CheckAuthMiddleware } from '#src/interface/api/middleware/checkAuth.middleware.js';
import { jwtHandle } from '#src/shared/helpers/jwt/infrastructure/dependencies.js';

export const checkAuth = new CheckAuthMiddleware(jwtHandle);
