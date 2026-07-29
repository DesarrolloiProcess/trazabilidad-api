import { and, eq, asc, gte, lte, count, inArray, type SQL } from 'drizzle-orm';
import { drizzleOrm, type Database } from '#src/shared/lib/drizzle/connection.js';
import { deliveries } from '#src/shared/lib/drizzle/models/delivery.schema.js';
import { deliveryProducts } from '#src/shared/lib/drizzle/models/deliveryProduct.schema.js';
import { deliveryStatusHistory } from '#src/shared/lib/drizzle/models/deliveryStatusHistory.schema.js';
import { routes } from '#src/shared/lib/drizzle/models/route.schema.js';
import { uuidHandle } from '#src/shared/helpers/uuidHandle/infrastructure/dependencies.js';
import { Delivery, type IDeliveryProduct } from '#src/modules/delivery/domain/delivery.entity.js';
import type { IDeliveryQuery, IDeliveryRepository, IDeliveryStatusHistoryEntry } from '#src/modules/delivery/domain/delivery.repository.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

async function recordStatusHistory(
  executor: Database | ITransaction,
  deliveryId: string,
  status: Delivery['status'],
  changedAt: Date,
): Promise<void> {
  await executor.insert(deliveryStatusHistory).values({
    id: uuidHandle.uuid(),
    delivery_id: deliveryId,
    status,
    changed_at: changedAt,
  });
}

type DeliveryRow = typeof deliveries.$inferSelect;
type DeliveryProductRow = typeof deliveryProducts.$inferSelect;

function toProduct(row: DeliveryProductRow): IDeliveryProduct {
  return {
    code: row.code,
    description: row.description,
    quantity: row.quantity,
    price: Number(row.price),
  };
}

function toEntity(row: DeliveryRow, products: IDeliveryProduct[]): Delivery {
  return new Delivery({
    id: row.id,
    routeId: row.route_id,
    clientId: row.client_id,
    trackingNumber: row.tracking_number,
    address: row.address,
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone,
    patientId: row.patient_id,
    products,
    status: row.status,
    signatureUrl: row.signature_url,
    photoUrl: row.photo_url,
    receiverName: row.receiver_name,
    receiverIdNumber: row.receiver_id_number,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    observation: row.observation,
    deliveredAt: row.delivered_at,
    invoiced: row.invoiced,
    invoicedAt: row.invoiced_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  });
}

/** Trae y agrupa los renglones de delivery_products de un lote de entregas en una sola consulta (evita el N+1). */
async function attachProducts(rows: DeliveryRow[]): Promise<Delivery[]> {
  if (rows.length === 0) return [];

  const deliveryIds = rows.map((row) => row.id);
  const productRows = await drizzleOrm()
    .select()
    .from(deliveryProducts)
    .where(inArray(deliveryProducts.delivery_id, deliveryIds));

  const productsByDeliveryId = new Map<string, IDeliveryProduct[]>();
  for (const productRow of productRows) {
    const list = productsByDeliveryId.get(productRow.delivery_id) ?? [];
    list.push(toProduct(productRow));
    productsByDeliveryId.set(productRow.delivery_id, list);
  }

  return rows.map((row) => toEntity(row, productsByDeliveryId.get(row.id) ?? []));
}

export class DrizzleDeliveryImpl implements IDeliveryRepository {
  async getMany(query: IDeliveryQuery): Promise<{ data: Delivery[]; total: number }> {
    const offset = (query.page - 1) * query.limit;

    if (query.distributionCenterId) {
      // Requiere join con routes: deliveries no tiene distribution_center_id propio, cuelga de su ruta.
      const conditions = [eq(routes.distribution_center_id, query.distributionCenterId)];
      if (query.routeId) conditions.push(eq(deliveries.route_id, query.routeId));
      const joinFilter = and(...conditions);

      const [rows, [{ total }]] = await Promise.all([
        drizzleOrm()
          .select({ deliveries })
          .from(deliveries)
          .innerJoin(routes, eq(deliveries.route_id, routes.id))
          .where(joinFilter)
          .limit(query.limit)
          .offset(offset),
        drizzleOrm()
          .select({ total: count() })
          .from(deliveries)
          .innerJoin(routes, eq(deliveries.route_id, routes.id))
          .where(joinFilter),
      ]);

      return { data: await attachProducts(rows.map((r) => r.deliveries)), total };
    }

    const filters: SQL | undefined = query.routeId ? eq(deliveries.route_id, query.routeId) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      drizzleOrm().select().from(deliveries).where(filters).limit(query.limit).offset(offset),
      drizzleOrm().select({ total: count() }).from(deliveries).where(filters),
    ]);

    return { data: await attachProducts(rows), total };
  }

  async getById(id: string): Promise<Delivery | null> {
    const [row] = await drizzleOrm().select().from(deliveries).where(eq(deliveries.id, id)).limit(1);
    if (!row) return null;

    const [entity] = await attachProducts([row]);
    return entity;
  }

  async getByTrackingNumber(trackingNumber: string): Promise<Delivery | null> {
    const [row] = await drizzleOrm().select().from(deliveries).where(eq(deliveries.tracking_number, trackingNumber)).limit(1);
    if (!row) return null;

    const [entity] = await attachProducts([row]);
    return entity;
  }

  async getManyByClientId(clientId: string): Promise<Delivery[]> {
    const rows = await drizzleOrm().select().from(deliveries).where(eq(deliveries.client_id, clientId));
    return attachProducts(rows);
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

    return attachProducts(rows);
  }

  async create(entity: Delivery, config?: { tx?: ITransaction }): Promise<Delivery> {
    const executor = config?.tx ?? drizzleOrm();

    await executor.insert(deliveries).values({
      id: entity.id,
      route_id: entity.routeId,
      client_id: entity.clientId,
      tracking_number: entity.trackingNumber,
      address: entity.address,
      recipient_name: entity.recipientName,
      recipient_phone: entity.recipientPhone,
      patient_id: entity.patientId,
      status: entity.status,
      signature_url: entity.signatureUrl,
      photo_url: entity.photoUrl,
      receiver_name: entity.receiverName,
      receiver_id_number: entity.receiverIdNumber,
      latitude: entity.latitude === null ? null : String(entity.latitude),
      longitude: entity.longitude === null ? null : String(entity.longitude),
      observation: entity.observation,
      delivered_at: entity.deliveredAt,
      invoiced: entity.invoiced,
      invoiced_at: entity.invoicedAt,
      created_by: entity.createdBy,
      updated_by: entity.updatedBy,
    });

    if (entity.products.length > 0) {
      await executor.insert(deliveryProducts).values(
        entity.products.map((product) => ({
          id: uuidHandle.uuid(),
          delivery_id: entity.id,
          code: product.code,
          description: product.description,
          quantity: product.quantity,
          price: String(product.price),
          created_by: entity.createdBy,
          updated_by: entity.updatedBy,
        })),
      );
    }

    await recordStatusHistory(executor, entity.id, entity.status, entity.createdAt);

    return entity;
  }

  async update(entity: Delivery, config?: { tx?: ITransaction }): Promise<Delivery> {
    const executor = config?.tx ?? drizzleOrm();

    const [before] = await executor
      .select({ status: deliveries.status })
      .from(deliveries)
      .where(eq(deliveries.id, entity.id))
      .limit(1);

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
        invoiced: entity.invoiced,
        invoiced_at: entity.invoicedAt,
        updated_by: entity.updatedBy,
      })
      .where(eq(deliveries.id, entity.id));

    // Solo se registra un cambio de estado real (evita un renglon duplicado cuando
    // update() se llama solo para marcar facturada u otro campo que no es el status).
    if (before && before.status !== entity.status) {
      await recordStatusHistory(executor, entity.id, entity.status, entity.updatedAt);
    }

    return entity;
  }

  async getStatusHistory(deliveryId: string): Promise<IDeliveryStatusHistoryEntry[]> {
    const rows = await drizzleOrm()
      .select({ status: deliveryStatusHistory.status, changed_at: deliveryStatusHistory.changed_at })
      .from(deliveryStatusHistory)
      .where(eq(deliveryStatusHistory.delivery_id, deliveryId))
      .orderBy(asc(deliveryStatusHistory.changed_at));

    return rows.map((row) => ({ status: row.status, changedAt: row.changed_at }));
  }

  async updateRecipientPhoneByPatientId(patientId: string, phone: string, config?: { tx?: ITransaction }): Promise<void> {
    const executor = config?.tx ?? drizzleOrm();

    await executor.update(deliveries).set({ recipient_phone: phone }).where(eq(deliveries.patient_id, patientId));
  }
}
