import { plainToInstance } from 'class-transformer';
import { validateOrReject, type ValidationError } from 'class-validator';
import { CommandError } from '#src/shared/Errors/commandError.js';

export abstract class BaseCommand {
  static async create<T extends BaseCommand>(this: new () => T, data: Record<string, unknown>): Promise<T> {
    const instance = plainToInstance(this, data);

    try {
      await validateOrReject(instance as object, {
        whitelist: true,
        forbidNonWhitelisted: false,
        validationError: { target: false },
      });
    } catch (errors) {
      throw new CommandError(this.name, errors as ValidationError[]);
    }

    return instance;
  }
}
