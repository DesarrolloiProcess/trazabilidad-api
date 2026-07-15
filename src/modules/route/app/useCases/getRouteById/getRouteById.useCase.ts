import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import { ForbiddenError } from '#src/shared/Errors/forbiddenError.js';
import { Role } from '#src/shared/constant/roles.constant.js';
import type { Route } from '#src/modules/route/domain/route.entity.js';
import type { IRouteRepository } from '#src/modules/route/domain/route.repository.js';
import type { GetRouteByIdCommand } from '#src/modules/route/app/useCases/getRouteById/getRouteById.command.js';

export class GetRouteByIdUseCase {
  constructor(private readonly repository: IRouteRepository) {}

  async run(command: GetRouteByIdCommand): Promise<Route> {
    const entity = await this.repository.getById(command.id);

    if (!entity) {
      throw new EntityNotFoundError('Ruta', command.id);
    }

    if (command.authUser.role === Role.CONDUCTOR && entity.driverId !== command.authUser.id) {
      throw new ForbiddenError('No tienes acceso a esta ruta');
    }

    return entity;
  }
}
