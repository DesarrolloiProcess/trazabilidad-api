import { mysqlTable, varchar, boolean, uniqueIndex } from 'drizzle-orm/mysql-core';
import { customBuffer } from '../types/customBuffer.js';
import { baseColumns } from './_shared/baseColumns.js';

export const patients = mysqlTable(
  'patients',
  {
    id: customBuffer('id').primaryKey(),
    name: varchar('name', { length: 150 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    email: varchar('email', { length: 150 }),
    document_number: varchar('document_number', { length: 30 }),
    active: boolean('active').notNull().default(true),
    ...baseColumns,
  },
  (table) => ({
    phoneUniqueIdx: uniqueIndex('patients_phone_unique_idx').on(table.phone),
  }),
);
