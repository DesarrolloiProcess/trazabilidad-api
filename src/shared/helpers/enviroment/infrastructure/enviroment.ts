import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import type { IEnviroment } from '#src/shared/helpers/enviroment/domain/enviroment.js';
import { envSchema, type EnvSchema } from '#src/shared/helpers/enviroment/infrastructure/enviroment.schema.js';

export class Enviroment implements IEnviroment {
  public readonly NODE_ENV: IEnviroment['NODE_ENV'];
  public readonly APP: IEnviroment['APP'];
  public readonly DB: IEnviroment['DB'];
  public readonly JWT: IEnviroment['JWT'];
  public readonly BCRYPT: IEnviroment['BCRYPT'];
  public readonly WHATSAPP: IEnviroment['WHATSAPP'];
  public readonly CORS: IEnviroment['CORS'];

  constructor(env: EnvSchema) {
    this.NODE_ENV = env.NODE_ENV;
    this.APP = { PORT_API_WEB: env.PORT_API_WEB };
    this.DB = {
      HOST: env.DB_HOST,
      PORT: env.DB_PORT,
      USER: env.DB_USER,
      PASSWORD: env.DB_PASSWORD,
      NAME: env.DB_NAME,
    };
    this.JWT = {
      PRIVATE_KEY_PATH: env.JWT_PRIVATE_KEY_PATH,
      PUBLIC_KEY_PATH: env.JWT_PUBLIC_KEY_PATH,
      EXPIRES_IN: env.JWT_EXPIRES_IN,
    };
    this.BCRYPT = { SALT_ROUNDS: env.BCRYPT_SALT_ROUNDS };
    this.WHATSAPP = {
      API_URL: env.WHATSAPP_API_URL,
      API_TOKEN: env.WHATSAPP_API_TOKEN,
      SENDER_ID: env.WHATSAPP_SENDER_ID,
    };
    this.CORS = { ORIGIN: env.CORS_ORIGIN };
  }

  static fromProcessEnv(): Enviroment {
    dotenvExpand.expand(dotenv.config());
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      throw new Error(`Configuración de entorno inválida: ${parsed.error.message}`);
    }

    return new Enviroment(parsed.data);
  }
}
