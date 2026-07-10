import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { enviroment } from '#src/shared/helpers/enviroment/infrastructure/dependencies.js';
import * as schema from '#src/shared/lib/drizzle/models/index.js';

const pool = mysql.createPool({
  host: enviroment.DB.HOST,
  port: enviroment.DB.PORT,
  user: enviroment.DB.USER,
  password: enviroment.DB.PASSWORD,
  database: enviroment.DB.NAME,
});

export const db = drizzle(pool, { schema, mode: 'default' });

export type Database = typeof db;

export function drizzleOrm(): Database {
  return db;
}
