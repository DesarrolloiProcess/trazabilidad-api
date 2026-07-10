import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { Route } from '#src/modules/route/domain/route.entity.js';
import type { IRouteRepository } from '#src/modules/route/domain/route.repository.js';
import type { UpdateRouteStatusCommand } from '#src/modules/route/app/useCases/updateRouteStatus/updateRouteStatus.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

export class UpdateRouteStatusUseCase {
  constructor(private readonly repository: IRouteRepository) {}

  async run(command: UpdateRouteStatusCommand, transaction?: ITransaction): Promise<Route> {
    const current = await this.repository.getById(command.id);

    if (!current) {
      throw new EntityNotFoundError('Ruta', command.id);
    }

    const updated = current.advanceStatus(command.status, command.authUser.id);

    return this.repository.update(updated, { tx: transaction });
  }
}
