import { UuidHandleImpl } from '#src/shared/helpers/uuidHandle/infrastructure/uuidHandle.impl.js';
import { UuidHandleService } from '#src/shared/helpers/uuidHandle/app/uuidHandle.service.js';

const uuidHandleImpl = new UuidHandleImpl();

export const uuidHandle = new UuidHandleService(uuidHandleImpl);
