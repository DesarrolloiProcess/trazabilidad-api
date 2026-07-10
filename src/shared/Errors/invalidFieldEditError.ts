import { DomainError } from '#src/shared/Errors/domainError.js';

export class InvalidFieldEditError extends DomainError {
  public readonly statusCode = 422;
  public readonly code = 'INVALID_FIELD_EDIT';

  constructor(entity: string, field: string) {
    super(`El campo '${field}' de '${entity}' no puede ser editado en el estado actual`);
  }
}
