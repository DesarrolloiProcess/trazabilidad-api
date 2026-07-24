import { and, eq, count, desc, type SQL } from 'drizzle-orm';
import { drizzleOrm } from '#src/shared/lib/drizzle/connection.js';
import { routes } from '#src/shared/lib/drizzle/models/route.schema.js';
import { Route } from '#src/modules/route/domain/route.entity.js';
import type { IRouteQuery, IRouteRepository } from '#src/modules/route/domain/route.repository.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

type RouteRow = typeof routes.$inferSelect;

function toEntity(row: RouteRow): Route {
  return new Route({
    id: row.id,
    code: row.code,
    distributionCenterId: row.distribution_center_id,
    driverId: row.driver_id,
    date: row.date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  });
}

function buildFilters(query: IRouteQuery): SQL | undefined {
  const conditions: SQL[] = [];

  if (query.distributionCenterId) {
    conditions.push(eq(routes.distribution_center_id, query.distributionCenterId));
  }

  if (query.driverId) {
    conditions.push(eq(routes.driver_id, query.driverId));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export class DrizzleRouteImpl implements IRouteRepository {
  async getMany(query: IRouteQuery): Promise<{ data: Route[]; total: number }> {
    const offset = (query.page - 1) * query.limit;
    const filters = buildFilters(query);

    const [rows, [{ total }]] = await Promise.all([
      drizzleOrm()
        .select()
        .from(routes)
        .where(filters)
        // Empate por fecha (ej. un conductor con varias rutas del mismo dia) se
        // resuelve por creacion mas reciente, para que el orden sea predecible
        // en vez de depender del orden fisico/indice de MySQL.
        .orderBy(desc(routes.date), desc(routes.created_at))
        .limit(query.limit)
        .offset(offset),
      drizzleOrm().select({ total: count() }).from(routes).where(filters),
    ]);

    return { data: rows.map(toEntity), total };
  }

  async getById(id: string): Promise<Route | null> {
    const [row] = await drizzleOrm().select().from(routes).where(eq(routes.id, id)).limit(1);
    return row ? toEntity(row) : null;
  }

  async create(entity: Route, config?: { tx?: ITransaction }): Promise<Route> {
    const executor = config?.tx ?? drizzleOrm();

    await executor.insert(routes).values({
      id: entity.id,
      code: entity.code,
      distribution_center_id: entity.distributionCenterId,
      driver_id: entity.driverId,
      date: entity.date,
      status: entity.status,
      created_by: entity.createdBy,
      updated_by: entity.updatedBy,
    });

    return entity;
  }

  async update(entity: Route, config?: { tx?: ITransaction }): Promise<Route> {
    const executor = config?.tx ?? drizzleOrm();

    await executor
      .update(routes)
      .set({
        status: entity.status,
        driver_id: entity.driverId,
        updated_by: entity.updatedBy,
      })
      .where(eq(routes.id, entity.id));

    return entity;
  }
}
