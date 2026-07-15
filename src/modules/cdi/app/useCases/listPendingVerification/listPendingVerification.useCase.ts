import type { IRouteRepository } from '#src/modules/route/domain/route.repository.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import { toRouteDto } from '#src/modules/route/app/dto/route.dto.js';
import { toDeliveryDto } from '#src/modules/delivery/app/dto/delivery.dto.js';
import type { ListPendingVerificationCommand } from '#src/modules/cdi/app/useCases/listPendingVerification/listPendingVerification.command.js';
import type { PendingVerificationDto } from '#src/modules/cdi/app/dto/pendingVerification.dto.js';

const PENDING_DELIVERIES_PAGE_LIMIT = 500;

export class ListPendingVerificationUseCase {
  constructor(
    private readonly routeRepository: IRouteRepository,
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async run(command: ListPendingVerificationCommand): Promise<PendingVerificationDto[]> {
    const { data: routes } = await this.routeRepository.getMany({
      distributionCenterId: command.distributionCenterId,
      page: 1,
      limit: 100,
    });

    const result: PendingVerificationDto[] = [];

    for (const route of routes) {
      const { data: deliveries } = await this.deliveryRepository.getMany({
        routeId: route.id,
        page: 1,
        limit: PENDING_DELIVERIES_PAGE_LIMIT,
      });

      const pending = deliveries.filter((delivery) => delivery.status === 'creado');

      if (pending.length > 0) {
        result.push({ route: toRouteDto(route), deliveries: pending.map(toDeliveryDto) });
      }
    }

    result.sort((a, b) => a.route.date.getTime() - b.route.date.getTime());

    return result;
  }
}
