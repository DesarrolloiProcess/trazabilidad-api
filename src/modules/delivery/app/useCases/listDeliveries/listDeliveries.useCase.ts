import { ForbiddenError } from '#src/shared/Errors/forbiddenError.js';
import { Role } from '#src/shared/constant/roles.constant.js';
import type { Delivery } from '#src/modules/delivery/domain/delivery.entity.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { IRouteRepository } from '#src/modules/route/domain/route.repository.js';
import type { ListDeliveriesCommand } from '#src/modules/delivery/app/useCases/listDeliveries/listDeliveries.command.js';

export class ListDeliveriesUseCase {
  constructor(
    private readonly repository: IDeliveryRepository,
    private readonly routeRepository: IRouteRepository,
  ) {}

  async run(command: ListDeliveriesCommand): Promise<{ data: Delivery[]; total: number }> {
    if (command.authUser.role === Role.CONDUCTOR) {
      // El conductor solo ve entregas de una ruta suya — sin routeId no hay a qué ruta restringirlo.
      if (!command.routeId) {
        throw new ForbiddenError('Debes especificar la ruta para consultar tus entregas');
      }

      const route = await this.routeRepository.getById(command.routeId);
      if (!route || route.driverId !== command.authUser.id) {
        throw new ForbiddenError('No tienes acceso a esta ruta');
      }

      return this.repository.getMany({ page: command.page, limit: command.limit, routeId: command.routeId });
    }

    if (command.authUser.role === Role.CEDI && command.authUser.distributionCenterId) {
      return this.repository.getMany({
        page: command.page,
        limit: command.limit,
        routeId: command.routeId,
        distributionCenterId: command.authUser.distributionCenterId,
      });
    }

    return this.repository.getMany({ page: command.page, limit: command.limit, routeId: command.routeId });
  }
}
