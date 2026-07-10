import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { IUserRepository } from '#src/modules/user/domain/user.repository.js';
import type { DeleteUserCommand } from '#src/modules/user/app/useCases/deleteUser/deleteUser.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

export class DeleteUserUseCase {
  constructor(private readonly repository: IUserRepository) {}

  async run(command: DeleteUserCommand, transaction?: ITransaction): Promise<void> {
    const current = await this.repository.getById(command.id);

    if (!current) {
      throw new EntityNotFoundError('Usuario', command.id);
    }

    await this.repository.delete(command.id, { tx: transaction });
  }
}
