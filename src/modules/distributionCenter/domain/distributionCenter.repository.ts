import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';
import type { DistributionCenter } from '#src/modules/distributionCenter/domain/distributionCenter.entity.js';

export interface IDistributionCenterQuery {
  page: number;
  limit: number;
}

export interface IDistributionCenterRepository {
  getMany(query: IDistributionCenterQuery): Promise<{ data: DistributionCenter[]; total: number }>;
  getById(id: string): Promise<DistributionCenter | null>;
  create(entity: DistributionCenter, config?: { tx?: ITransaction }): Promise<DistributionCenter>;
  update(entity: DistributionCenter, config?: { tx?: ITransaction }): Promise<DistributionCenter>;
  delete(id: string, config?: { tx?: ITransaction }): Promise<void>;
}
