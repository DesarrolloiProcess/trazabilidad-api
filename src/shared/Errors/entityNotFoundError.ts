import { AppError } from '#src/shared/Errors/appError.js';

export class EntityNotFoundError extends AppError {
  public readonly statusCode = 404;
  public readonly code = 'ENTITY_NOT_FOUND';

  constructor(entity: string, identifier?: string) {
    super(identifier ? `${entity} no encontrado(a): ${identifier}` : `${entity} no encontrado(a)`);
  }
}
