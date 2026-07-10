import { mysqlTable, varchar, boolean, datetime, mysqlEnum } from 'drizzle-orm/mysql-core';
import { customBuffer } from '#src/shared/lib/drizzle/types/customBuffer.js';
import { baseColumns } from '#src/shared/lib/drizzle/models/_shared/baseColumns.js';

export const userRoleValues = ['CEDI', 'CONDUCTOR', 'ADMIN'] as const;

export const users = mysqlTable('users', {
  id: customBuffer('id').primaryKey(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 150 }).notNull(),
  role: mysqlEnum('role', userRoleValues).notNull(),
  distribution_center_id: customBuffer('distribution_center_id'),
  otp_code: varchar('otp_code', { length: 10 }),
  otp_expires_at: datetime('otp_expires_at'),
  active: boolean('active').notNull().default(true),
  ...baseColumns,
});
