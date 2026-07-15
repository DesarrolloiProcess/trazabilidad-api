import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import { ForbiddenError } from '#src/shared/Errors/forbiddenError.js';
import { Role } from '#src/shared/constant/roles.constant.js';
import type { Delivery } from '#src/modules/delivery/domain/delivery.entity.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { IRouteRepository } from '#src/modules/route/domain/route.repository.js';
import type { GetDeliveryByIdCommand } from '#src/modules/delivery/app/useCases/getDeliveryById/getDeliveryById.command.js';

export class GetDeliveryByIdUseCase {
  constructor(
    private readonly repository: IDeliveryRepository,
    private readonly routeRepository: IRouteRepository,
  ) {}

  async run(command: GetDeliveryByIdCommand): Promise<Delivery> {
    const entity = await this.repository.getById(command.id);

    if (!entity) {
      throw new EntityNotFoundError('Entrega', command.id);
    }

    if (command.authUser.role === Role.CONDUCTOR) {
      const route = await this.routeRepository.getById(entity.routeId);
      if (!route || route.driverId !== command.authUser.id) {
        throw new ForbiddenError('No tienes acceso a esta entrega');
      }
    }

    return entity;
  }
}
