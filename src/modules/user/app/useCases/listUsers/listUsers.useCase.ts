import type { User } from '#src/modules/user/domain/user.entity.js';
import type { IUserRepository } from '#src/modules/user/domain/user.repository.js';
import type { ListUsersCommand } from '#src/modules/user/app/useCases/listUsers/listUsers.command.js';

export class ListUsersUseCase {
  constructor(private readonly repository: IUserRepository) {}

  async run(command: ListUsersCommand): Promise<{ data: User[]; total: number }> {
    return this.repository.getMany({ page: command.page, limit: command.limit });
  }
}
