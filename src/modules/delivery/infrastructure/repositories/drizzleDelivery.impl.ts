import { and, eq, gte, lte, count, type SQL } from 'drizzle-orm';
import { drizzleOrm } from '#src/shared/lib/drizzle/connection.js';
import { deliveries } from '#src/shared/lib/drizzle/models/delivery.schema.js';
import { Delivery } from '#src/modules/delivery/domain/delivery.entity.js';
import type { IDeliveryQuery, IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

type DeliveryRow = typeof deliveries.$inferSelect;

function toEntity(row: DeliveryRow): Delivery {
  return new Delivery({
    id: row.id,
    routeId: row.route_id,
    trackingNumber: row.tracking_number,
    address: row.address,
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone,
    products: row.products,
    status: row.status,
    signatureUrl: row.signature_url,
    photoUrl: row.photo_url,
    receiverName: row.receiver_name,
    receiverIdNumber: row.receiver_id_number,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    observation: row.observation,
    deliveredAt: row.delivered_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  });
}

export class DrizzleDeliveryImpl implements IDeliveryRepository {
  async getMany(query: IDeliveryQuery): Promise<{ data: Delivery[]; total: number }> {
    const offset = (query.page - 1) * query.limit;
    const filters: SQL | undefined = query.routeId ? eq(deliveries.route_id, query.routeId) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      drizzleOrm().select().from(deliveries).where(filters).limit(query.limit).offset(offset),
      drizzleOrm().select({ total: count() }).from(deliveries).where(filters),
    ]);

    return { data: rows.map(toEntity), total };
  }

  async getById(id: string): Promise<Delivery | null> {
    const [row] = await drizzleOrm().select().from(deliveries).where(eq(deliveries.id, id)).limit(1);
    return row ? toEntity(row) : null;
  }

  async getByTrackingNumber(trackingNumber: string): Promise<Delivery | null> {
    const [row] = await drizzleOrm().select().from(deliveries).where(eq(deliveries.tracking_number, trackingNumber)).limit(1);
    return row ? toEntity(row) : null;
  }

  async getConfirmedInWindow(from: Date, to: Date): Promise<Delivery[]> {
    const rows = await drizzleOrm()
      .select()
      .from(deliveries)
      .where(
        and(
          eq(deliveries.status, 'entregado_cliente'),
          gte(deliveries.delivered_at, from),
          lte(deliveries.delivered_at, to),
        ),
      );

    return rows.map(toEntity);
  }

  async create(entity: Delivery, config?: { tx?: ITransaction }): Promise<Delivery> {
    const executor = config?.tx ?? drizzleOrm();

    await executor.insert(deliveries).values({
      id: entity.id,
      route_id: entity.routeId,
      tracking_number: entity.trackingNumber,
      address: entity.address,
      recipient_name: entity.recipientName,
      recipient_phone: entity.recipientPhone,
      products: entity.products,
      status: entity.status,
      signature_url: entity.signatureUrl,
      photo_url: entity.photoUrl,
      receiver_name: entity.receiverName,
      receiver_id_number: entity.receiverIdNumber,
      latitude: entity.latitude === null ? null : String(entity.latitude),
      longitude: entity.longitude === null ? null : String(entity.longitude),
      observation: entity.observation,
      delivered_at: entity.deliveredAt,
      created_by: entity.createdBy,
      updated_by: entity.updatedBy,
    });

    return entity;
  }

  async update(entity: Delivery, config?: { tx?: ITransaction }): Promise<Delivery> {
    const executor = config?.tx ?? drizzleOrm();

    await executor
      .update(deliveries)
      .set({
        status: entity.status,
        signature_url: entity.signatureUrl,
        photo_url: entity.photoUrl,
        receiver_name: entity.receiverName,
        receiver_id_number: entity.receiverIdNumber,
        latitude: entity.latitude === null ? null : String(entity.latitude),
        longitude: entity.longitude === null ? null : String(entity.longitude),
        observation: entity.observation,
        delivered_at: entity.deliveredAt,
        updated_by: entity.updatedBy,
      })
      .where(eq(deliveries.id, entity.id));

    return entity;
  }
}
