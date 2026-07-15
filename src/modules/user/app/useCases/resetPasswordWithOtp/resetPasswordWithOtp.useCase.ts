import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import { UnauthorizedError } from '#src/shared/Errors/unauthorizedError.js';
import type { IUserRepository } from '#src/modules/user/domain/user.repository.js';
import type { IEncryptRepository } from '#src/shared/helpers/encrypt/domain/encrypt.js';
import type { ResetPasswordWithOtpCommand } from '#src/modules/user/app/useCases/resetPasswordWithOtp/resetPasswordWithOtp.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

export class ResetPasswordWithOtpUseCase {
  constructor(
    private readonly repository: IUserRepository,
    private readonly encryptHandle: IEncryptRepository,
  ) {}

  async run(command: ResetPasswordWithOtpCommand, transaction?: ITransaction): Promise<void> {
    const user = await this.repository.getByEmail(command.email);

    if (!user) {
      throw new EntityNotFoundError('Usuario', command.email);
    }

    if (!user.isOtpValid(command.otpCode)) {
      throw new UnauthorizedError('El código OTP es inválido o ha expirado');
    }

    const newPasswordHash = await this.encryptHandle.hash(command.newPassword);
    const updated = user.changePassword(newPasswordHash, user.id).clearOtp();

    await this.repository.update(updated, { tx: transaction });
  }
}
