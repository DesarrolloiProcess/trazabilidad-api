import type { IEncryptRepository } from '#src/shared/helpers/encrypt/domain/encrypt.js';

export class EncryptService implements IEncryptRepository {
  constructor(private readonly repository: IEncryptRepository) {}

  hash(plain: string): Promise<string> {
    return this.repository.hash(plain);
  }

  compare(plain: string, hashed: string): Promise<boolean> {
    return this.repository.compare(plain, hashed);
  }
}
