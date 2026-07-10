import { DomainError } from '#src/shared/Errors/domainError.js';

export class EntityFieldError extends DomainError {
  public readonly statusCode = 422;
  public readonly code = 'ENTITY_FIELD_ERROR';

  constructor(entity: string, field: string, reason: string) {
    super(`${entity}.${field} inválido: ${reason}`);
  }
}
