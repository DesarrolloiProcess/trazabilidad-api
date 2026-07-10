import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { User } from '#src/modules/user/domain/user.entity.js';
import type { IUserRepository } from '#src/modules/user/domain/user.repository.js';
import type { GetUserByIdCommand } from '#src/modules/user/app/useCases/getUserById/getUserById.command.js';

export class GetUserByIdUseCase {
  constructor(private readonly repository: IUserRepository) {}

  async run(command: GetUserByIdCommand): Promise<User> {
    const entity = await this.repository.getById(command.id);

    if (!entity) {
      throw new EntityNotFoundError('Usuario', command.id);
    }

    return entity;
  }
}
