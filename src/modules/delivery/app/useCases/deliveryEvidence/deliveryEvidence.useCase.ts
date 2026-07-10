import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { Delivery } from '#src/modules/delivery/domain/delivery.entity.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { DeliveryEvidenceCommand } from '#src/modules/delivery/app/useCases/deliveryEvidence/deliveryEvidence.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';
import { WhatsappNotifierService } from '#src/shared/helpers/whatsappNotifier/app/whatsappNotifier.service.js';

export class DeliveryEvidenceUseCase {
  constructor(
    private readonly repository: IDeliveryRepository,
    private readonly whatsappNotifier: WhatsappNotifierService,
  ) {}

  async run(command: DeliveryEvidenceCommand, transaction?: ITransaction): Promise<Delivery> {
    const current = await this.repository.getById(command.id);

    if (!current) {
      throw new EntityNotFoundError('Entrega', command.id);
    }

    const updated = current.confirmarEntrega(
      {
        signatureUrl: command.signatureUrl,
        photoUrl: command.photoUrl,
        receiverName: command.receiverName,
        receiverIdNumber: command.receiverIdNumber,
        latitude: command.latitude,
        longitude: command.longitude,
      },
      command.authUser.id,
    );

    const saved = await this.repository.update(updated, { tx: transaction });

    await this.whatsappNotifier.notifyDeliveryConfirmed(saved.recipientPhone, saved.trackingNumber);

    return saved;
  }
}
