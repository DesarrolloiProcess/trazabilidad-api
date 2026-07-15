import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'mysql',
  // drizzle-kit no resuelve extensiones .js que apuntan a fuente .ts (patrón NodeNext) —
  // por eso apunta al build ya compilado. Los scripts db:generate/db:migrate corren `npm run build` antes.
  schema: './dist/shared/lib/drizzle/models/index.js',
  out: './drizzle',
  dbCredentials: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'trazabilidad',
  },
});
