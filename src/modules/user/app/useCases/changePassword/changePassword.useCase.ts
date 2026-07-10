import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import { UnauthorizedError } from '#src/shared/Errors/unauthorizedError.js';
import type { User } from '#src/modules/user/domain/user.entity.js';
import type { IUserRepository } from '#src/modules/user/domain/user.repository.js';
import type { IEncryptRepository } from '#src/shared/helpers/encrypt/domain/encrypt.js';
import type { ChangePasswordCommand } from '#src/modules/user/app/useCases/changePassword/changePassword.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

export class ChangePasswordUseCase {
  constructor(
    private readonly repository: IUserRepository,
    private readonly encryptHandle: IEncryptRepository,
  ) {}

  async run(command: ChangePasswordCommand, transaction?: ITransaction): Promise<User> {
    const current = await this.repository.getById(command.authUser.id);

    if (!current) {
      throw new EntityNotFoundError('Usuario', command.authUser.id);
    }

    const isCurrentPasswordValid = await this.encryptHandle.compare(command.currentPassword, current.passwordHash);

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('La contraseña actual no es correcta');
    }

    const newPasswordHash = await this.encryptHandle.hash(command.newPassword);
    const updated = current.changePassword(newPasswordHash, command.authUser.id);

    return this.repository.update(updated, { tx: transaction });
  }
}
