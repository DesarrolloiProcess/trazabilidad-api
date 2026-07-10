import type { Route } from '#src/modules/route/domain/route.entity.js';
import type { IRouteRepository } from '#src/modules/route/domain/route.repository.js';
import type { ListRoutesCommand } from '#src/modules/route/app/useCases/listRoutes/listRoutes.command.js';

export class ListRoutesUseCase {
  constructor(private readonly repository: IRouteRepository) {}

  async run(command: ListRoutesCommand): Promise<{ data: Route[]; total: number }> {
    return this.repository.getMany({
      page: command.page,
      limit: command.limit,
      distributionCenterId: command.distributionCenterId,
      driverId: command.driverId,
    });
  }
}
