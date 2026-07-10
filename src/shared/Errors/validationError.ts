import { AppError } from '#src/shared/Errors/appError.js';

export class ValidationError extends AppError {
  public readonly statusCode = 422;
  public readonly code = 'VALIDATION_ERROR';

  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}
