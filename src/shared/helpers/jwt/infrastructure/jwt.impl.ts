import fs from 'node:fs';
import jwt from 'jsonwebtoken';
import type { IJwtPayload, IJwtRepository } from '#src/shared/helpers/jwt/domain/jwt.js';
import { enviroment } from '#src/shared/helpers/enviroment/infrastructure/dependencies.js';
import { UnauthorizedError } from '#src/shared/Errors/unauthorizedError.js';

export class JwtImpl implements IJwtRepository {
  private readonly privateKey = fs.readFileSync(enviroment.JWT.PRIVATE_KEY_PATH, 'utf-8');
  private readonly publicKey = fs.readFileSync(enviroment.JWT.PUBLIC_KEY_PATH, 'utf-8');

  sign(payload: IJwtPayload): string {
    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: enviroment.JWT.EXPIRES_IN,
    } as jwt.SignOptions);
  }

  verify<T extends IJwtPayload>(token: string): T {
    try {
      return jwt.verify(token, this.publicKey, { algorithms: ['RS256'] }) as T;
    } catch {
      throw new UnauthorizedError('Token inválido o expirado');
    }
  }
}
