import { eq } from 'drizzle-orm';
import { drizzleOrm } from '#src/shared/lib/drizzle/connection.js';
import { clients } from '#src/shared/lib/drizzle/models/client.schema.js';
import { Client } from '#src/modules/client/domain/client.entity.js';
import type { IClientRepository } from '#src/modules/client/domain/client.repository.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

type ClientRow = typeof clients.$inferSelect;

function toEntity(row: ClientRow): Client {
  return new Client({
    id: row.id,
    nit: row.nit,
    name: row.name,
    phone: row.phone,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  });
}

export class DrizzleClientImpl implements IClientRepository {
  async getById(id: string): Promise<Client | null> {
    const [row] = await drizzleOrm().select().from(clients).where(eq(clients.id, id)).limit(1);
    return row ? toEntity(row) : null;
  }

  async getByNit(nit: string): Promise<Client | null> {
    const [row] = await drizzleOrm().select().from(clients).where(eq(clients.nit, nit)).limit(1);
    return row ? toEntity(row) : null;
  }

  async create(entity: Client, config?: { tx?: ITransaction }): Promise<Client> {
    const executor = config?.tx ?? drizzleOrm();

    await executor.insert(clients).values({
      id: entity.id,
      nit: entity.nit,
      name: entity.name,
      phone: entity.phone,
      active: entity.active,
      created_by: entity.createdBy,
      updated_by: entity.updatedBy,
    });

    return entity;
  }
}
