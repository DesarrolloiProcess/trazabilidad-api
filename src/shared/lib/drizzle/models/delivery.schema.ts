import { mysqlTable, varchar, json, mysqlEnum, decimal, datetime } from 'drizzle-orm/mysql-core';
import { customBuffer } from '#src/shared/lib/drizzle/types/customBuffer.js';
import { baseColumns } from '#src/shared/lib/drizzle/models/_shared/baseColumns.js';

export const deliveryStatusValues = [
  'creado',
  'alistado',
  'entregado_transportador',
  'entregado_cliente',
  'no_entregado',
] as const;

export interface DeliveryProductRow {
  code: string;
  description: string;
  quantity: number;
  price: number;
}

export const deliveries = mysqlTable('deliveries', {
  id: customBuffer('id').primaryKey(),
  route_id: customBuffer('route_id').notNull(),
  client_id: customBuffer('client_id').notNull(),
  tracking_number: varchar('tracking_number', { length: 50 }).notNull().unique(),
  address: varchar('address', { length: 255 }).notNull(),
  recipient_name: varchar('recipient_name', { length: 150 }).notNull(),
  recipient_phone: varchar('recipient_phone', { length: 20 }).notNull(),
  products: json('products').$type<DeliveryProductRow[]>().notNull(),
  status: mysqlEnum('status', deliveryStatusValues).notNull().default('creado'),
  signature_url: varchar('signature_url', { length: 255 }),
  photo_url: varchar('photo_url', { length: 255 }),
  receiver_name: varchar('receiver_name', { length: 150 }),
  receiver_id_number: varchar('receiver_id_number', { length: 20 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  observation: varchar('observation', { length: 500 }),
  delivered_at: datetime('delivered_at'),
  ...baseColumns,
});
