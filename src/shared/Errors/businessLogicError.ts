import { DomainError } from '#src/shared/Errors/domainError.js';

export class BusinessLogicError extends DomainError {
  public readonly statusCode = 422;
  public readonly code = 'BUSINESS_LOGIC_ERROR';

  constructor(message: string) {
    super(message);
  }
}
