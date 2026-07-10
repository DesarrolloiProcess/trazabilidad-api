import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';
import type { Route } from '#src/modules/route/domain/route.entity.js';

export interface IRouteQuery {
  page: number;
  limit: number;
  distributionCenterId?: string;
  driverId?: string;
}

export interface IRouteRepository {
  getMany(query: IRouteQuery): Promise<{ data: Route[]; total: number }>;
  getById(id: string): Promise<Route | null>;
  create(entity: Route, config?: { tx?: ITransaction }): Promise<Route>;
  update(entity: Route, config?: { tx?: ITransaction }): Promise<Route>;
}
