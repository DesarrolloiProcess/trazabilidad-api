import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { IJwtRepository } from '#src/shared/helpers/jwt/domain/jwt.js';
import type { Role } from '#src/shared/constant/roles.constant.js';
import type { AuthenticatedUser } from '#src/shared/commands/authenticatedUser.js';
import { UnauthorizedError } from '#src/shared/Errors/unauthorizedError.js';
import { ForbiddenError } from '#src/shared/Errors/forbiddenError.js';
import { checkRoles } from '#src/shared/utils/checkRoles.js';

export class CheckAuthMiddleware {
  constructor(private readonly jwtRepository: IJwtRepository) {}

  run(allowedRoles: Role[] = []): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction): void => {
      try {
        const authorization = req.headers.authorization;

        if (!authorization?.startsWith('Bearer ')) {
          throw new UnauthorizedError('Token no proporcionado');
        }

        const token = authorization.replace('Bearer ', '');
        const payload = this.jwtRepository.verify<AuthenticatedUser>(token);

        if (!checkRoles(payload.role, allowedRoles)) {
          throw new ForbiddenError('El rol del usuario no tiene acceso a este recurso');
        }

        req.user = payload;
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
