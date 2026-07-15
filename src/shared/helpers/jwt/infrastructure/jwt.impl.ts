import fs from 'node:fs';
import jwt from 'jsonwebtoken';
import type { IJwtPayload, IJwtRepository } from '#src/shared/helpers/jwt/domain/jwt.js';
import { enviroment } from '#src/shared/helpers/enviroment/infrastructure/dependencies.js';
import { UnauthorizedError } from '#src/shared/Errors/unauthorizedError.js';

/** Prefiere el contenido PEM directo (env var) y cae a leer el archivo si no está configurado — necesario en despliegues donde no se sube el archivo de la llave. */
function loadKey(content: string, path: string): string {
  if (content.trim().length > 0) return content;
  return fs.readFileSync(path, 'utf-8');
}

export class JwtImpl implements IJwtRepository {
  private readonly privateKey = loadKey(enviroment.JWT.PRIVATE_KEY, enviroment.JWT.PRIVATE_KEY_PATH);
  private readonly publicKey = loadKey(enviroment.JWT.PUBLIC_KEY, enviroment.JWT.PUBLIC_KEY_PATH);

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
