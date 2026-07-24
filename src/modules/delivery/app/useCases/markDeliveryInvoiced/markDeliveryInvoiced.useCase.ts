import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import { ForbiddenError } from '#src/shared/Errors/forbiddenError.js';
import { Role } from '#src/shared/constant/roles.constant.js';
import type { Delivery } from '#src/modules/delivery/domain/delivery.entity.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { IRouteRepository } from '#src/modules/route/domain/route.repository.js';
import type { MarkDeliveryInvoicedCommand } from '#src/modules/delivery/app/useCases/markDeliveryInvoiced/markDeliveryInvoiced.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

export class MarkDeliveryInvoicedUseCase {
  constructor(
    private readonly repository: IDeliveryRepository,
    private readonly routeRepository: IRouteRepository,
  ) {}

  async run(command: MarkDeliveryInvoicedCommand, transaction?: ITransaction): Promise<Delivery> {
    const current = await this.repository.getById(command.id);

    if (!current) {
      throw new EntityNotFoundError('Entrega', command.id);
    }

    if (command.authUser.role === Role.CEDI) {
      const route = await this.routeRepository.getById(current.routeId);
      if (!route || route.distributionCenterId !== command.authUser.distributionCenterId) {
        throw new ForbiddenError('No puedes facturar entregas de otra droguería');
      }
    }

    const updated = current.marcarFacturada(command.authUser.id);

    return this.repository.update(updated, { tx: transaction });
  }
}
