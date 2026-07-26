import { mysqlTable, datetime, mysqlEnum, index } from 'drizzle-orm/mysql-core';
import { customBuffer } from '../types/customBuffer.js';
import { deliveries, deliveryStatusValues } from './delivery.schema.js';

/** Rastro de cada cambio de estado de una entrega, para mostrar la línea de tiempo en el detalle.
 * La tabla `deliveries` solo guarda el estado ACTUAL — este historial existe aparte porque
 * cada UPDATE sobrescribe el estado anterior sin dejar rastro de cuándo ocurrió cada cambio. */
export const deliveryStatusHistory = mysqlTable(
  'delivery_status_history',
  {
    id: customBuffer('id').primaryKey(),
    delivery_id: customBuffer('delivery_id')
      .notNull()
      .references(() => deliveries.id),
    status: mysqlEnum('status', deliveryStatusValues).notNull(),
    changed_at: datetime('changed_at').notNull(),
  },
  (table) => ({
    deliveryIdIdx: index('delivery_status_history_delivery_id_idx').on(table.delivery_id),
  }),
);
