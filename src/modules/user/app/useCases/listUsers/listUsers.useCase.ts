import { Role } from '#src/shared/constant/roles.constant.js';
import type { User } from '#src/modules/user/domain/user.entity.js';
import type { IUserRepository } from '#src/modules/user/domain/user.repository.js';
import type { ListUsersCommand } from '#src/modules/user/app/useCases/listUsers/listUsers.command.js';

export class ListUsersUseCase {
  constructor(private readonly repository: IUserRepository) {}

  async run(command: ListUsersCommand): Promise<{ data: User[]; total: number }> {
    // El usuario CEDI (rol interno) solo puede ver los conductores de su propia droguería —
    // no la lista completa de usuarios (admins, otras sedes), sin importar qué filtros pida.
    if (command.authUser.role === Role.CEDI) {
      return this.repository.getMany({
        page: command.page,
        limit: command.limit,
        role: Role.CONDUCTOR,
        distributionCenterId: command.authUser.distributionCenterId ?? undefined,
      });
    }

    return this.repository.getMany({ page: command.page, limit: command.limit, role: command.role });
  }
}
