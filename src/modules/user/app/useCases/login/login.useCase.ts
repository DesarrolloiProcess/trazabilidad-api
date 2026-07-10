import type { IUserRepository } from '#src/modules/user/domain/user.repository.js';
import type { IEncryptRepository } from '#src/shared/helpers/encrypt/domain/encrypt.js';
import type { IJwtRepository } from '#src/shared/helpers/jwt/domain/jwt.js';
import type { LoginCommand } from '#src/modules/user/app/useCases/login/login.command.js';
import type { LoginResultDto } from '#src/modules/user/app/dto/loginResult.dto.js';
import { toUserDto } from '#src/modules/user/app/dto/user.dto.js';
import { UnauthorizedError } from '#src/shared/Errors/unauthorizedError.js';

export class LoginUseCase {
  constructor(
    private readonly repository: IUserRepository,
    private readonly encryptHandle: IEncryptRepository,
    private readonly jwtHandle: IJwtRepository,
  ) {}

  async run(command: LoginCommand): Promise<LoginResultDto> {
    const user = await this.repository.getByEmail(command.email);

    if (!user || !user.active) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const isPasswordValid = await this.encryptHandle.compare(command.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const token = this.jwtHandle.sign({
      id: user.id,
      role: user.role,
      distributionCenterId: user.distributionCenterId ?? undefined,
    });

    return { token, user: toUserDto(user) };
  }
}
