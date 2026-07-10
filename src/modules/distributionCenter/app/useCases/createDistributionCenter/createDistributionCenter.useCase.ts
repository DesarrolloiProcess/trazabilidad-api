import { DistributionCenter } from '#src/modules/distributionCenter/domain/distributionCenter.entity.js';
import type { IDistributionCenterRepository } from '#src/modules/distributionCenter/domain/distributionCenter.repository.js';
import type { CreateDistributionCenterCommand } from '#src/modules/distributionCenter/app/useCases/createDistributionCenter/createDistributionCenter.command.js';
import type { IUuidRepository } from '#src/shared/helpers/uuidHandle/domain/uuidHandle.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

export class CreateDistributionCenterUseCase {
  constructor(
    private readonly repository: IDistributionCenterRepository,
    private readonly uuidHandle: IUuidRepository,
  ) {}

  async run(command: CreateDistributionCenterCommand, transaction?: ITransaction): Promise<DistributionCenter> {
    const now = new Date();

    const entity = new DistributionCenter({
      id: this.uuidHandle.uuid(),
      name: command.name,
      city: command.city,
      address: command.address,
      active: true,
      createdAt: now,
      updatedAt: now,
      createdBy: command.authUser.id,
      updatedBy: command.authUser.id,
    });

    return this.repository.create(entity, { tx: transaction });
  }
}
