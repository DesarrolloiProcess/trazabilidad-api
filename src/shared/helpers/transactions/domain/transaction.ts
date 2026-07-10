import type { ITransaction } from '#src/shared/lib/drizzle/types/transaction.type.js';

export type { ITransaction };

export interface ITransactionRepository {
  buildTransaction<T>(handler: (tx: ITransaction) => Promise<T>): Promise<T>;
}
