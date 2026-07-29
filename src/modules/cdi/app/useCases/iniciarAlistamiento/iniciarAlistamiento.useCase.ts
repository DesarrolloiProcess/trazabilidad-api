import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { IRouteRepository } from '#src/modules/route/domain/route.repository.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { IniciarAlistamientoCommand } from '#src/modules/cdi/app/useCases/iniciarAlistamiento/iniciarAlistamiento.command.js';

const PENDING_DELIVERIES_PAGE_LIMIT = 500;

export class IniciarAlistamientoUseCase {
  constructor(
    private readonly routeRepository: IRouteRepository,
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async run(command: IniciarAlistamientoCommand): Promise<void> {
    const route = await this.routeRepository.getById(command.id);

    if (!route) {
      throw new EntityNotFoundError('Ruta', command.id);
    }

    const { data: deliveries } = await this.deliveryRepository.getMany({
      routeId: command.id,
      page: 1,
      limit: PENDING_DELIVERIES_PAGE_LIMIT,
    });

    const pending = deliveries.filter((delivery) => delivery.status === 'creado' && !delivery.alistamientoStartedAt);

    for (const delivery of pending) {
      const started = delivery.iniciarAlistamiento(command.authUser.id);
      await this.deliveryRepository.update(started);
    }
  }
}
