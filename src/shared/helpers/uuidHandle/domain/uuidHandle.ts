import type { UUID } from '#src/shared/helpers/uuidHandle/domain/uuid.type.js';

export interface IUuidRepository {
  uuid(): UUID;
  uuidToBin(uuid: UUID): Buffer;
  binToUuid(bin: Buffer): UUID;
}
