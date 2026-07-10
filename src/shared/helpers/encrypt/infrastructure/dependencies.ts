import { EncryptImpl } from '#src/shared/helpers/encrypt/infrastructure/encrypt.impl.js';
import { EncryptService } from '#src/shared/helpers/encrypt/app/encrypt.service.js';

const encryptImpl = new EncryptImpl();

export const encryptHandle = new EncryptService(encryptImpl);
