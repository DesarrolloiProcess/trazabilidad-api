import type { Delivery } from '#src/modules/delivery/domain/delivery.entity.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { ListDeliveriesCommand } from '#src/modules/delivery/app/useCases/listDeliveries/listDeliveries.command.js';

export class ListDeliveriesUseCase {
  constructor(private readonly repository: IDeliveryRepository) {}

  async run(command: ListDeliveriesCommand): Promise<{ data: Delivery[]; total: number }> {
    return this.repository.getMany({ page: command.page, limit: command.limit, routeId: command.routeId });
  }
}
