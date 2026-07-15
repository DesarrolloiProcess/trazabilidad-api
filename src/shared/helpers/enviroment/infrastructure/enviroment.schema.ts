import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT_API_WEB: z.coerce.number().int().default(3000),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1),

  /** Ruta al archivo .pem — usada en local/dev. En plataformas cloud (Railway, etc.) se prefiere el contenido directo. */
  JWT_PRIVATE_KEY_PATH: z.string().default(''),
  JWT_PUBLIC_KEY_PATH: z.string().default(''),
  /** Contenido PEM directo — evita depender de que el archivo llegue al filesystem del despliegue. */
  JWT_PRIVATE_KEY: z.string().default(''),
  JWT_PUBLIC_KEY: z.string().default(''),
  JWT_EXPIRES_IN: z.string().default('8h'),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().default(10),

  WHATSAPP_API_URL: z.string().min(1),
  WHATSAPP_API_TOKEN: z.string().default(''),
  WHATSAPP_SENDER_ID: z.string().default(''),

  CORS_ORIGIN: z.string().default('*'),
});

export type EnvSchema = z.infer<typeof envSchema>;
