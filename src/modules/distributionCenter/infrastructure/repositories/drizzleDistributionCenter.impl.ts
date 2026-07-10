import { eq, count } from 'drizzle-orm';
import { drizzleOrm } from '#src/shared/lib/drizzle/connection.js';
import { distributionCenters } from '#src/shared/lib/drizzle/models/distributionCenter.schema.js';
import { DistributionCenter } from '#src/modules/distributionCenter/domain/distributionCenter.entity.js';
import type {
  IDistributionCenterQuery,
  IDistributionCenterRepository,
} from '#src/modules/distributionCenter/domain/distributionCenter.repository.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

type DistributionCenterRow = typeof distributionCenters.$inferSelect;

function toEntity(row: DistributionCenterRow): DistributionCenter {
  return new DistributionCenter({
    id: row.id,
    name: row.name,
    city: row.city,
    address: row.address,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  });
}

export class DrizzleDistributionCenterImpl implements IDistributionCenterRepository {
  async getMany(query: IDistributionCenterQuery): Promise<{ data: DistributionCenter[]; total: number }> {
    const offset = (query.page - 1) * query.limit;

    const [rows, [{ total }]] = await Promise.all([
      drizzleOrm().select().from(distributionCenters).limit(query.limit).offset(offset),
      drizzleOrm().select({ total: count() }).from(distributionCenters),
    ]);

    return { data: rows.map(toEntity), total };
  }

  async getById(id: string): Promise<DistributionCenter | null> {
    const [row] = await drizzleOrm().select().from(distributionCenters).where(eq(distributionCenters.id, id)).limit(1);

    return row ? toEntity(row) : null;
  }

  async create(entity: DistributionCenter, config?: { tx?: ITransaction }): Promise<DistributionCenter> {
    const executor = config?.tx ?? drizzleOrm();

    await executor.insert(distributionCenters).values({
      id: entity.id,
      name: entity.name,
      city: entity.city,
      address: entity.address,
      active: entity.active,
      created_by: entity.createdBy,
      updated_by: entity.updatedBy,
    });

    return entity;
  }

  async update(entity: DistributionCenter, config?: { tx?: ITransaction }): Promise<DistributionCenter> {
    const executor = config?.tx ?? drizzleOrm();

    await executor
      .update(distributionCenters)
      .set({
        name: entity.name,
        city: entity.city,
        address: entity.address,
        active: entity.active,
        updated_by: entity.updatedBy,
      })
      .where(eq(distributionCenters.id, entity.id));

    return entity;
  }

  async delete(id: string, config?: { tx?: ITransaction }): Promise<void> {
    const executor = config?.tx ?? drizzleOrm();

    await executor.delete(distributionCenters).where(eq(distributionCenters.id, id));
  }
}
