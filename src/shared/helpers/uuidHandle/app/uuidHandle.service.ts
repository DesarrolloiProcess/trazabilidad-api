import { customAlphabet } from 'nanoid';
import type { IUuidRepository } from '#src/shared/helpers/uuidHandle/domain/uuidHandle.js';
import type { UUID } from '#src/shared/helpers/uuidHandle/domain/uuid.type.js';

const shortCodeAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class UuidHandleService implements IUuidRepository {
  constructor(private readonly repository: IUuidRepository) {}

  uuid(): UUID {
    return this.repository.uuid();
  }

  uuidToBin(uuid: UUID): Buffer {
    return this.repository.uuidToBin(uuid);
  }

  binToUuid(bin: Buffer): UUID {
    return this.repository.binToUuid(bin);
  }

  shortCode(size = 6): string {
    return customAlphabet(shortCodeAlphabet, size)();
  }
}
