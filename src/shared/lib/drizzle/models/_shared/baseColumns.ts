import { sql } from 'drizzle-orm';
import { datetime } from 'drizzle-orm/mysql-core';
import { customBuffer } from '#src/shared/lib/drizzle/types/customBuffer.js';

export const baseColumns = {
  created_at: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: datetime('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  created_by: customBuffer('created_by'),
  updated_by: customBuffer('updated_by'),
};
