import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import { ForbiddenError } from '#src/shared/Errors/forbiddenError.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { TrackDeliveryCommand } from '#src/modules/clientPortal/app/useCases/trackDelivery/trackDelivery.command.js';
import { toPublicDeliveryDto, type PublicDeliveryDto } from '#src/modules/clientPortal/app/dto/publicDelivery.dto.js';

export class TrackDeliveryUseCase {
  constructor(private readonly repository: IDeliveryRepository) {}

  async run(command: TrackDeliveryCommand): Promise<PublicDeliveryDto> {
    const delivery = await this.repository.getByTrackingNumber(command.trackingNumber);

    if (!delivery) {
      throw new EntityNotFoundError('Pedido', command.trackingNumber);
    }

    const isVerified =
      command.verificationValue === delivery.recipientPhone ||
      (delivery.receiverIdNumber !== null && command.verificationValue === delivery.receiverIdNumber);

    if (!isVerified) {
      throw new ForbiddenError('Los datos de verificación no coinciden con el pedido');
    }

    return toPublicDeliveryDto(delivery);
  }
}
