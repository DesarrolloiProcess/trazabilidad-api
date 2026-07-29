import { mysqlTable, varchar, mysqlEnum, decimal, datetime, boolean, index, longtext } from 'drizzle-orm/mysql-core';
import { customBuffer } from '../types/customBuffer.js';
import { baseColumns } from './_shared/baseColumns.js';
import { routes } from './route.schema.js';
import { clients } from './client.schema.js';
import { patients } from './patient.schema.js';
import { users } from './user.schema.js';

export const deliveryStatusValues = [
  'creado',
  'alistado',
  'entregado_transportador',
  'entregado_cliente',
  'no_entregado',
] as const;

export const deliveries = mysqlTable(
  'deliveries',
  {
    id: customBuffer('id').primaryKey(),
    route_id: customBuffer('route_id')
      .notNull()
      .references(() => routes.id),
    client_id: customBuffer('client_id')
      .notNull()
      .references(() => clients.id),
    tracking_number: varchar('tracking_number', { length: 50 }).notNull().unique(),
    address: varchar('address', { length: 255 }).notNull(),
    recipient_name: varchar('recipient_name', { length: 150 }).notNull(),
    recipient_phone: varchar('recipient_phone', { length: 20 }).notNull(),
    /** Vincula la guía a un registro de paciente administrable — el nombre/teléfono de arriba se
     * mantienen tal cual llegaron en la planilla (compatibilidad con el resto del sistema); si el
     * ADMIN corrige el teléfono del paciente, se sincroniza aquí en cascada, no se reemplaza esta columna. */
    patient_id: customBuffer('patient_id').references(() => patients.id),
    status: mysqlEnum('status', deliveryStatusValues).notNull().default('creado'),
    /** Coordenadas del destino (geocodificadas al importar), para ubicar la entrega en el mapa antes de que se confirme. */
    destination_latitude: decimal('destination_latitude', { precision: 10, scale: 7 }),
    destination_longitude: decimal('destination_longitude', { precision: 10, scale: 7 }),
    signature_url: longtext('signature_url'),
    photo_url: longtext('photo_url'),
    receiver_name: varchar('receiver_name', { length: 150 }),
    receiver_id_number: varchar('receiver_id_number', { length: 20 }),
    latitude: decimal('latitude', { precision: 10, scale: 7 }),
    longitude: decimal('longitude', { precision: 10, scale: 7 }),
    observation: varchar('observation', { length: 500 }),
    delivered_at: datetime('delivered_at'),
    invoiced: boolean('invoiced').notNull().default(false),
    invoiced_at: datetime('invoiced_at'),
    /** Marca cuando el CDI abre la planilla para verificarla (hito de inicio del alistamiento) —
     * distinta de created_at (creación de la guía) y de alistamiento_ended_at (fin/liberación). */
    alistamiento_started_at: datetime('alistamiento_started_at'),
    alistamiento_ended_at: datetime('alistamiento_ended_at'),
    verifier_signature_url: longtext('verifier_signature_url'),
    verified_by: customBuffer('verified_by').references(() => users.id),
    ...baseColumns,
  },
  (table) => ({
    routeIdIdx: index('deliveries_route_id_idx').on(table.route_id),
    clientIdIdx: index('deliveries_client_id_idx').on(table.client_id),
    patientIdIdx: index('deliveries_patient_id_idx').on(table.patient_id),
  }),
);
