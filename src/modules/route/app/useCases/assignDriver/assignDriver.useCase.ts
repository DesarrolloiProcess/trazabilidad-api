import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import { BusinessLogicError } from '#src/shared/Errors/businessLogicError.js';
import { ForbiddenError } from '#src/shared/Errors/forbiddenError.js';
import { Role } from '#src/shared/constant/roles.constant.js';
import type { Route } from '#src/modules/route/domain/route.entity.js';
import type { IRouteRepository } from '#src/modules/route/domain/route.repository.js';
import type { IUserRepository } from '#src/modules/user/domain/user.repository.js';
import type { AssignDriverCommand } from '#src/modules/route/app/useCases/assignDriver/assignDriver.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

export class AssignDriverUseCase {
  constructor(
    private readonly repository: IRouteRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async run(command: AssignDriverCommand, transaction?: ITransaction): Promise<Route> {
    const route = await this.repository.getById(command.id);

    if (!route) {
      throw new EntityNotFoundError('Ruta', command.id);
    }

    // El CEDI solo puede asignar conductores dentro de su propia sede.
    if (command.authUser.role === Role.CEDI && route.distributionCenterId !== command.authUser.distributionCenterId) {
      throw new ForbiddenError('No puedes asignar conductores en rutas de otro CEDI');
    }

    const driver = await this.userRepository.getById(command.driverId);

    if (!driver || driver.role !== Role.CONDUCTOR || !driver.active) {
      throw new BusinessLogicError('El conductor indicado no existe o no está activo');
    }

    if (command.authUser.role === Role.CEDI && driver.distributionCenterId !== command.authUser.distributionCenterId) {
      throw new BusinessLogicError('El conductor debe pertenecer a tu mismo CEDI');
    }

    const updated = route.assignDriver(command.driverId, command.authUser.id);

    return this.repository.update(updated, { tx: transaction });
  }
}
