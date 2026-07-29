import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import { BusinessLogicError } from '#src/shared/Errors/businessLogicError.js';
import type { IRouteRepository } from '#src/modules/route/domain/route.repository.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { Delivery } from '#src/modules/delivery/domain/delivery.entity.js';
import { toDeliveryDto, type DeliveryDto } from '#src/modules/delivery/app/dto/delivery.dto.js';
import type { VerifyRouteCommand } from '#src/modules/cdi/app/useCases/verifyRoute/verifyRoute.command.js';
import type { ITransactionRepository } from '#src/shared/helpers/transactions/domain/transaction.js';

const PENDING_DELIVERIES_PAGE_LIMIT = 500;

export class VerifyRouteUseCase {
  constructor(
    private readonly routeRepository: IRouteRepository,
    private readonly deliveryRepository: IDeliveryRepository,
    private readonly transactionHandle: ITransactionRepository,
  ) {}

  async run(command: VerifyRouteCommand): Promise<DeliveryDto[]> {
    const route = await this.routeRepository.getById(command.id);

    if (!route) {
      throw new EntityNotFoundError('Ruta', command.id);
    }

    const { data: deliveries } = await this.deliveryRepository.getMany({
      routeId: command.id,
      page: 1,
      limit: PENDING_DELIVERIES_PAGE_LIMIT,
    });

    const pending = deliveries.filter((delivery) => delivery.status === 'creado');

    if (pending.length === 0) {
      throw new BusinessLogicError('Esta planilla no tiene entregas pendientes por verificar');
    }

    const updated = await this.transactionHandle.buildTransaction(async (tx) => {
      const results: Delivery[] = [];

      for (const delivery of pending) {
        const advanced = delivery.verificarAlistamiento(command.signatureUrl, command.authUser.id);
        const saved = await this.deliveryRepository.update(advanced, { tx });
        results.push(saved);
      }

      return results;
    });

    return updated.map(toDeliveryDto);
  }
}
