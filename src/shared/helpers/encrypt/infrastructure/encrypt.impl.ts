import bcrypt from 'bcrypt';
import type { IEncryptRepository } from '#src/shared/helpers/encrypt/domain/encrypt.js';
import { enviroment } from '#src/shared/helpers/enviroment/infrastructure/dependencies.js';

export class EncryptImpl implements IEncryptRepository {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, enviroment.BCRYPT.SALT_ROUNDS);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
