import { Role } from '#src/shared/constant/roles.constant.js';
import type { Route } from '#src/modules/route/domain/route.entity.js';
import type { IRouteRepository } from '#src/modules/route/domain/route.repository.js';
import type { ListRoutesCommand } from '#src/modules/route/app/useCases/listRoutes/listRoutes.command.js';

export class ListRoutesUseCase {
  constructor(private readonly repository: IRouteRepository) {}

  async run(command: ListRoutesCommand): Promise<{ data: Route[]; total: number }> {
    /**
     * CONDUCTOR y CEDI quedan forzados a su propio alcance (su ruta / su sede),
     * sin importar lo que el cliente haya enviado — el filtro no es una preferencia
     * de UI, es la frontera real de lo que ese rol puede ver.
     */
    const driverId = command.authUser.role === Role.CONDUCTOR ? command.authUser.id : command.driverId;
    const distributionCenterId =
      command.authUser.role === Role.CEDI
        ? (command.authUser.distributionCenterId ?? command.distributionCenterId)
        : command.distributionCenterId;

    return this.repository.getMany({
      page: command.page,
      limit: command.limit,
      distributionCenterId,
      driverId,
      code: command.code,
    });
  }
}
