import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';
import type { Client } from '#src/modules/client/domain/client.entity.js';

export interface IClientRepository {
  getById(id: string): Promise<Client | null>;
  getByNit(nit: string): Promise<Client | null>;
  create(entity: Client, config?: { tx?: ITransaction }): Promise<Client>;
}
