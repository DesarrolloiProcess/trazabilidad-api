import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import { ForbiddenError } from '#src/shared/Errors/forbiddenError.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { IClientRepository } from '#src/modules/client/domain/client.repository.js';
import type { ListMyDeliveriesCommand } from '#src/modules/clientPortal/app/useCases/listMyDeliveries/listMyDeliveries.command.js';
import { toPublicDeliveryDto } from '#src/modules/clientPortal/app/dto/publicDelivery.dto.js';
import type { MyDeliveriesDto } from '#src/modules/clientPortal/app/dto/myDeliveries.dto.js';
import { isClientAccessVerified } from '#src/modules/clientPortal/app/verifyClientAccess.js';

export class ListMyDeliveriesUseCase {
  constructor(
    private readonly deliveryRepository: IDeliveryRepository,
    private readonly clientRepository: IClientRepository,
  ) {}

  async run(command: ListMyDeliveriesCommand): Promise<MyDeliveriesDto> {
    const delivery = await this.deliveryRepository.getByTrackingNumber(command.trackingNumber);

    if (!delivery) {
      throw new EntityNotFoundError('Pedido', command.trackingNumber);
    }

    const client = await this.clientRepository.getById(delivery.clientId);

    if (!isClientAccessVerified(command.verificationValue, delivery, client) || !client) {
      throw new ForbiddenError('Los datos de verificación no coinciden con el pedido');
    }

    const deliveries = await this.deliveryRepository.getManyByClientId(client.id);

    return {
      client: { nit: client.nit, name: client.name },
      deliveries: deliveries.map(toPublicDeliveryDto),
    };
  }
}
