import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { Delivery } from '#src/modules/delivery/domain/delivery.entity.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { MarkNotDeliveredCommand } from '#src/modules/delivery/app/useCases/markNotDelivered/markNotDelivered.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

export class MarkNotDeliveredUseCase {
  constructor(private readonly repository: IDeliveryRepository) {}

  async run(command: MarkNotDeliveredCommand, transaction?: ITransaction): Promise<Delivery> {
    const current = await this.repository.getById(command.id);

    if (!current) {
      throw new EntityNotFoundError('Entrega', command.id);
    }

    const updated = current.marcarNoEntregado(command.observation, command.authUser.id);

    return this.repository.update(updated, { tx: transaction });
  }
}
