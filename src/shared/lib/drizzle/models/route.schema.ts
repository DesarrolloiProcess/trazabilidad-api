import { mysqlTable, varchar, datetime, mysqlEnum } from 'drizzle-orm/mysql-core';
import { customBuffer } from '#src/shared/lib/drizzle/types/customBuffer.js';
import { baseColumns } from '#src/shared/lib/drizzle/models/_shared/baseColumns.js';

export const routeStatusValues = ['creada', 'entregada_transportador', 'en_curso', 'completada', 'con_novedad'] as const;

export const routes = mysqlTable('routes', {
  id: customBuffer('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull(),
  distribution_center_id: customBuffer('distribution_center_id').notNull(),
  driver_id: customBuffer('driver_id'),
  date: datetime('date').notNull(),
  status: mysqlEnum('status', routeStatusValues).notNull().default('creada'),
  ...baseColumns,
});
