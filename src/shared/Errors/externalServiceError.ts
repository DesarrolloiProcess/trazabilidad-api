import { AppError } from '#src/shared/Errors/appError.js';

export class ExternalServiceError extends AppError {
  public readonly statusCode = 409;
  public readonly code = 'EXTERNAL_SERVICE_ERROR';

  constructor(service: string, message: string) {
    super(`Error en servicio externo (${service}): ${message}`);
  }
}
