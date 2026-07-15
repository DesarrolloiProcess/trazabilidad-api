import { UuidHandleImpl } from './uuidHandle.impl.js';
import { UuidHandleService } from '../app/uuidHandle.service.js';

const uuidHandleImpl = new UuidHandleImpl();

export const uuidHandle = new UuidHandleService(uuidHandleImpl);
