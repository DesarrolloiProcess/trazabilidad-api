import type { DistributionCenter } from '#src/modules/distributionCenter/domain/distributionCenter.entity.js';
import type { IDistributionCenterRepository } from '#src/modules/distributionCenter/domain/distributionCenter.repository.js';
import type { ListDistributionCentersCommand } from '#src/modules/distributionCenter/app/useCases/listDistributionCenters/listDistributionCenters.command.js';

export class ListDistributionCentersUseCase {
  constructor(private readonly repository: IDistributionCenterRepository) {}

  async run(command: ListDistributionCentersCommand): Promise<{ data: DistributionCenter[]; total: number }> {
    return this.repository.getMany({ page: command.page, limit: command.limit });
  }
}
