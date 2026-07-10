import { AppError } from '#src/shared/Errors/appError.js';

export class UnauthorizedError extends AppError {
  public readonly statusCode = 401;
  public readonly code = 'UNAUTHORIZED';

  constructor(message = 'No autorizado') {
    super(message);
  }
}
