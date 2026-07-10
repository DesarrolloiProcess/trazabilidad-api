import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { IDistributionCenterRepository } from '#src/modules/distributionCenter/domain/distributionCenter.repository.js';
import type { DeleteDistributionCenterCommand } from '#src/modules/distributionCenter/app/useCases/deleteDistributionCenter/deleteDistributionCenter.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

export class DeleteDistributionCenterUseCase {
  constructor(private readonly repository: IDistributionCenterRepository) {}

  async run(command: DeleteDistributionCenterCommand, transaction?: ITransaction): Promise<void> {
    const current = await this.repository.getById(command.id);

    if (!current) {
      throw new EntityNotFoundError('CEDI', command.id);
    }

    await this.repository.delete(command.id, { tx: transaction });
  }
}
