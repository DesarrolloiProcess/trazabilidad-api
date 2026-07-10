import type { ValidationError as ClassValidatorError } from 'class-validator';
import { AppError } from '#src/shared/Errors/appError.js';

export class CommandError extends AppError {
  public readonly statusCode = 422;
  public readonly code = 'COMMAND_ERROR';

  constructor(
    public readonly command: string,
    public readonly errors: ClassValidatorError[],
  ) {
    super(`Comando inválido (${command}): ${CommandError.flatten(errors)}`);
  }

  private static flatten(errors: ClassValidatorError[]): string {
    return errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .filter(Boolean)
      .join('; ');
  }
}
