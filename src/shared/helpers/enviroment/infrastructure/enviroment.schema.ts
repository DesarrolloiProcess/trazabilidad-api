import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT_API_WEB: z.coerce.number().int().default(3000),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1),

  JWT_PRIVATE_KEY_PATH: z.string().min(1),
  JWT_PUBLIC_KEY_PATH: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('8h'),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().default(10),

  WHATSAPP_API_URL: z.string().min(1),
  WHATSAPP_API_TOKEN: z.string().default(''),
  WHATSAPP_SENDER_ID: z.string().default(''),

  CORS_ORIGIN: z.string().default('*'),
});

export type EnvSchema = z.infer<typeof envSchema>;
