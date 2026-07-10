import { addMinutes } from 'date-fns';
import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { IUserRepository } from '#src/modules/user/domain/user.repository.js';
import type { IUuidRepository } from '#src/shared/helpers/uuidHandle/domain/uuidHandle.js';
import type { RequestOtpCommand } from '#src/modules/user/app/useCases/requestOtp/requestOtp.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

const OTP_EXPIRATION_MINUTES = 10;

interface IShortCodeGenerator {
  shortCode(size?: number): string;
}

export class RequestOtpUseCase {
  constructor(
    private readonly repository: IUserRepository,
    private readonly uuidHandle: IUuidRepository & IShortCodeGenerator,
  ) {}

  async run(command: RequestOtpCommand, transaction?: ITransaction): Promise<void> {
    const user = await this.repository.getByEmail(command.email);

    if (!user) {
      throw new EntityNotFoundError('Usuario', command.email);
    }

    const otpCode = this.uuidHandle.shortCode(6);
    const otpExpiresAt = addMinutes(new Date(), OTP_EXPIRATION_MINUTES);

    const updated = user.generateOtp(otpCode, otpExpiresAt);

    await this.repository.update(updated, { tx: transaction });
  }
}
