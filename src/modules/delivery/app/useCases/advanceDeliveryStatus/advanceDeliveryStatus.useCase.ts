import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { Delivery } from '#src/modules/delivery/domain/delivery.entity.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { AdvanceDeliveryStatusCommand } from '#src/modules/delivery/app/useCases/advanceDeliveryStatus/advanceDeliveryStatus.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

export class AdvanceDeliveryStatusUseCase {
  constructor(private readonly repository: IDeliveryRepository) {}

  async run(command: AdvanceDeliveryStatusCommand, transaction?: ITransaction): Promise<Delivery> {
    const current = await this.repository.getById(command.id);

    if (!current) {
      throw new EntityNotFoundError('Entrega', command.id);
    }

    const updated = current.avanzarEstado(command.status, command.authUser.id);

    return this.repository.update(updated, { tx: transaction });
  }
}
