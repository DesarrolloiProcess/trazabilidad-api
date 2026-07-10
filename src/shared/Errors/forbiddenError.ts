import { AppError } from '#src/shared/Errors/appError.js';

export class ForbiddenError extends AppError {
  public readonly statusCode = 403;
  public readonly code = 'FORBIDDEN';

  constructor(message = 'Acceso prohibido') {
    super(message);
  }
}
