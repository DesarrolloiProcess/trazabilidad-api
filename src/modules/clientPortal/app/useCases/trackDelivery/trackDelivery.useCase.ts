import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import { ForbiddenError } from '#src/shared/Errors/forbiddenError.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { IClientRepository } from '#src/modules/client/domain/client.repository.js';
import type { IPatientRepository } from '#src/modules/patient/domain/patient.repository.js';
import type { TrackDeliveryCommand } from '#src/modules/clientPortal/app/useCases/trackDelivery/trackDelivery.command.js';
import { toPublicDeliveryDto, type PublicDeliveryDto } from '#src/modules/clientPortal/app/dto/publicDelivery.dto.js';
import { isClientAccessVerified } from '#src/modules/clientPortal/app/verifyClientAccess.js';

export class TrackDeliveryUseCase {
  constructor(
    private readonly repository: IDeliveryRepository,
    private readonly clientRepository: IClientRepository,
    private readonly patientRepository: IPatientRepository,
  ) {}

  async run(command: TrackDeliveryCommand): Promise<PublicDeliveryDto> {
    const delivery = await this.repository.getByTrackingNumber(command.trackingNumber);

    if (!delivery) {
      throw new EntityNotFoundError('Pedido', command.trackingNumber);
    }

    const client = await this.clientRepository.getById(delivery.clientId);
    const patient = delivery.patientId ? await this.patientRepository.getById(delivery.patientId) : null;

    if (!isClientAccessVerified(command.verificationValue, delivery, client, patient)) {
      throw new ForbiddenError('Los datos de verificación no coinciden con el pedido');
    }

    return toPublicDeliveryDto(delivery);
  }
}
