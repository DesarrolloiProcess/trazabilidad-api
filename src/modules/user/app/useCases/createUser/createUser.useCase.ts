import { User } from '#src/modules/user/domain/user.entity.js';
import type { IUserRepository } from '#src/modules/user/domain/user.repository.js';
import type { CreateUserCommand } from '#src/modules/user/app/useCases/createUser/createUser.command.js';
import type { IUuidRepository } from '#src/shared/helpers/uuidHandle/domain/uuidHandle.js';
import type { IEncryptRepository } from '#src/shared/helpers/encrypt/domain/encrypt.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';
import { BusinessLogicError } from '#src/shared/Errors/businessLogicError.js';

export class CreateUserUseCase {
  constructor(
    private readonly repository: IUserRepository,
    private readonly uuidHandle: IUuidRepository,
    private readonly encryptHandle: IEncryptRepository,
  ) {}

  async run(command: CreateUserCommand, transaction?: ITransaction): Promise<User> {
    const existing = await this.repository.getByEmail(command.email);

    if (existing) {
      throw new BusinessLogicError(`Ya existe un usuario registrado con el correo ${command.email}`);
    }

    const now = new Date();
    const passwordHash = await this.encryptHandle.hash(command.password);

    const entity = new User({
      id: this.uuidHandle.uuid(),
      email: command.email,
      passwordHash,
      name: command.name,
      role: command.role,
      distributionCenterId: command.distributionCenterId ?? null,
      otpCode: null,
      otpExpiresAt: null,
      active: true,
      createdAt: now,
      updatedAt: now,
      createdBy: command.authUser.id,
      updatedBy: command.authUser.id,
    });

    return this.repository.create(entity, { tx: transaction });
  }
}
