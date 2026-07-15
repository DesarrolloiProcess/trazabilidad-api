import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { User } from '#src/modules/user/domain/user.entity.js';
import type { IUserRepository } from '#src/modules/user/domain/user.repository.js';
import type { UpdateUserCommand } from '#src/modules/user/app/useCases/updateUser/updateUser.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';
import { Role } from '#src/shared/constant/roles.constant.js';

export class UpdateUserUseCase {
  constructor(private readonly repository: IUserRepository) {}

  async run(command: UpdateUserCommand, transaction?: ITransaction): Promise<User> {
    const current = await this.repository.getById(command.id);

    if (!current) {
      throw new EntityNotFoundError('Usuario', command.id);
    }

    const nextRole = command.role ?? current.role;
    const distributionCenterId =
      nextRole === Role.ADMIN ? null : (command.distributionCenterId ?? current.distributionCenterId);

    let updated = current.rename({ name: command.name, role: command.role, distributionCenterId }, command.authUser.id);

    if (command.active !== undefined) {
      updated = command.active ? updated.activate(command.authUser.id) : updated.deactivate(command.authUser.id);
    }

    return this.repository.update(updated, { tx: transaction });
  }
}
