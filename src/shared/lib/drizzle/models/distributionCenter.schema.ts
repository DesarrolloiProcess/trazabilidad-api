import { mysqlTable, varchar, boolean } from 'drizzle-orm/mysql-core';
import { customBuffer } from '../types/customBuffer.js';
import { baseColumns } from './_shared/baseColumns.js';

export const distributionCenters = mysqlTable('distribution_centers', {
  id: customBuffer('id').primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  active: boolean('active').notNull().default(true),
  ...baseColumns,
});
