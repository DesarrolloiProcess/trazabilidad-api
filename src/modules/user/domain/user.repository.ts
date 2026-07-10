import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';
import type { User } from '#src/modules/user/domain/user.entity.js';

export interface IUserQuery {
  page: number;
  limit: number;
}

export interface IUserRepository {
  getMany(query: IUserQuery): Promise<{ data: User[]; total: number }>;
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  create(entity: User, config?: { tx?: ITransaction }): Promise<User>;
  update(entity: User, config?: { tx?: ITransaction }): Promise<User>;
  delete(id: string, config?: { tx?: ITransaction }): Promise<void>;
}
