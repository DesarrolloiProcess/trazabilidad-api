import { v4 as uuidV4, parse as uuidParse, stringify as uuidStringify } from 'uuid';
import type { IUuidRepository } from '#src/shared/helpers/uuidHandle/domain/uuidHandle.js';
import type { UUID } from '#src/shared/helpers/uuidHandle/domain/uuid.type.js';

export class UuidHandleImpl implements IUuidRepository {
  uuid(): UUID {
    return uuidV4();
  }

  uuidToBin(uuid: UUID): Buffer {
    return Buffer.from(uuidParse(uuid) as Uint8Array);
  }

  binToUuid(bin: Buffer): UUID {
    return uuidStringify(bin);
  }
}
