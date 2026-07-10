import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { User } from '#src/modules/user/domain/user.entity.js';
import type { IUserRepository } from '#src/modules/user/domain/user.repository.js';
import type { UpdateUserCommand } from '#src/modules/user/app/useCases/updateUser/updateUser.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

export class UpdateUserUseCase {
  constructor(private readonly repository: IUserRepository) {}

  async run(command: UpdateUserCommand, transaction?: ITransaction): Promise<User> {
    const current = await this.repository.getById(command.id);

    if (!current) {
      throw new EntityNotFoundError('Usuario', command.id);
    }

    const updated = current.rename(
      { name: command.name, role: command.role, distributionCenterId: command.distributionCenterId ?? null },
      command.authUser.id,
    );

    return this.repository.update(updated, { tx: transaction });
  }
}
