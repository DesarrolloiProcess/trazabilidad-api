import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { Delivery } from '#src/modules/delivery/domain/delivery.entity.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { GetDeliveryByIdCommand } from '#src/modules/delivery/app/useCases/getDeliveryById/getDeliveryById.command.js';

export class GetDeliveryByIdUseCase {
  constructor(private readonly repository: IDeliveryRepository) {}

  async run(command: GetDeliveryByIdCommand): Promise<Delivery> {
    const entity = await this.repository.getById(command.id);

    if (!entity) {
      throw new EntityNotFoundError('Entrega', command.id);
    }

    return entity;
  }
}
