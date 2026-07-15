import { mysqlTable, varchar, int, decimal, index } from 'drizzle-orm/mysql-core';
import { customBuffer } from '../types/customBuffer.js';
import { baseColumns } from './_shared/baseColumns.js';
import { deliveries } from './delivery.schema.js';

export const deliveryProducts = mysqlTable(
  'delivery_products',
  {
    id: customBuffer('id').primaryKey(),
    delivery_id: customBuffer('delivery_id')
      .notNull()
      .references(() => deliveries.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 50 }).notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    quantity: int('quantity').notNull(),
    price: decimal('price', { precision: 12, scale: 2 }).notNull(),
    ...baseColumns,
  },
  (table) => ({
    deliveryIdIdx: index('delivery_products_delivery_id_idx').on(table.delivery_id),
  }),
);
