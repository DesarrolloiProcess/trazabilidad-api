import { mysqlTable, varchar, boolean } from 'drizzle-orm/mysql-core';
import { customBuffer } from '#src/shared/lib/drizzle/types/customBuffer.js';
import { baseColumns } from '#src/shared/lib/drizzle/models/_shared/baseColumns.js';

export const clients = mysqlTable('clients', {
  id: customBuffer('id').primaryKey(),
  nit: varchar('nit', { length: 30 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  active: boolean('active').notNull().default(true),
  ...baseColumns,
});
