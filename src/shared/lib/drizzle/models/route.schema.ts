import { mysqlTable, varchar, datetime, mysqlEnum, index, uniqueIndex } from 'drizzle-orm/mysql-core';
import { customBuffer } from '../types/customBuffer.js';
import { baseColumns } from './_shared/baseColumns.js';
import { distributionCenters } from './distributionCenter.schema.js';
import { users } from './user.schema.js';

export const routeStatusValues = ['creada', 'asignada', 'entregada_transportador', 'en_curso', 'completada', 'con_novedad'] as const;

export const routes = mysqlTable(
  'routes',
  {
    id: customBuffer('id').primaryKey(),
    code: varchar('code', { length: 50 }).notNull(),
    distribution_center_id: customBuffer('distribution_center_id')
      .notNull()
      .references(() => distributionCenters.id),
    driver_id: customBuffer('driver_id').references(() => users.id),
    date: datetime('date').notNull(),
    status: mysqlEnum('status', routeStatusValues).notNull().default('creada'),
    ...baseColumns,
  },
  (table) => ({
    distributionCenterIdIdx: index('routes_distribution_center_id_idx').on(table.distribution_center_id),
    driverIdIdx: index('routes_driver_id_idx').on(table.driver_id),
    codeUniqueIdx: uniqueIndex('routes_code_unique_idx').on(table.code),
  }),
);
