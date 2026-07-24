import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { DistributionCenter } from '#src/modules/distributionCenter/domain/distributionCenter.entity.js';
import type { IDistributionCenterRepository } from '#src/modules/distributionCenter/domain/distributionCenter.repository.js';
import type { UpdateDistributionCenterCommand } from '#src/modules/distributionCenter/app/useCases/updateDistributionCenter/updateDistributionCenter.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

export class UpdateDistributionCenterUseCase {
  constructor(private readonly repository: IDistributionCenterRepository) {}

  async run(command: UpdateDistributionCenterCommand, transaction?: ITransaction): Promise<DistributionCenter> {
    const current = await this.repository.getById(command.id);

    if (!current) {
      throw new EntityNotFoundError('Droguería', command.id);
    }

    let updated = current.rename(
      { name: command.name, city: command.city, address: command.address },
      command.authUser.id,
    );

    if (command.active !== undefined) {
      updated = command.active ? updated.activate(command.authUser.id) : updated.deactivate(command.authUser.id);
    }

    return this.repository.update(updated, { tx: transaction });
  }
}
