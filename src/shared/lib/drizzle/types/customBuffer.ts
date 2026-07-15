import { customType } from 'drizzle-orm/mysql-core';
import { uuidHandle } from '../../../helpers/uuidHandle/infrastructure/dependencies.js';
import type { UUID } from '../../../helpers/uuidHandle/domain/uuid.type.js';

export const customBuffer = customType<{ data: UUID; driverData: Buffer }>({
  dataType() {
    return 'binary(16)';
  },
  toDriver(value: UUID): Buffer {
    return uuidHandle.uuidToBin(value);
  },
  fromDriver(value: Buffer): UUID {
    return uuidHandle.binToUuid(value);
  },
});
