import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { DistributionCenter } from '#src/modules/distributionCenter/domain/distributionCenter.entity.js';
import type { IDistributionCenterRepository } from '#src/modules/distributionCenter/domain/distributionCenter.repository.js';
import type { GetDistributionCenterByIdCommand } from '#src/modules/distributionCenter/app/useCases/getDistributionCenterById/getDistributionCenterById.command.js';

export class GetDistributionCenterByIdUseCase {
  constructor(private readonly repository: IDistributionCenterRepository) {}

  async run(command: GetDistributionCenterByIdCommand): Promise<DistributionCenter> {
    const entity = await this.repository.getById(command.id);

    if (!entity) {
      throw new EntityNotFoundError('CEDI', command.id);
    }

    return entity;
  }
}
