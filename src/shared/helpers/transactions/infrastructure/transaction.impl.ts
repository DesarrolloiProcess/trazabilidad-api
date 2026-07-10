import { drizzleOrm } from '#src/shared/lib/drizzle/connection.js';
import type { ITransaction, ITransactionRepository } from '#src/shared/helpers/transactions/domain/transaction.js';

export class TransactionImpl implements ITransactionRepository {
  async buildTransaction<T>(handler: (tx: ITransaction) => Promise<T>): Promise<T> {
    return drizzleOrm().transaction(handler);
  }
}
