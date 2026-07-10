import type { NextFunction, Request, Response } from 'express';
import { ListUsersCommand } from '#src/modules/user/app/useCases/listUsers/listUsers.command.js';
import type { ListUsersUseCase } from '#src/modules/user/app/useCases/listUsers/listUsers.useCase.js';
import { toUserDto } from '#src/modules/user/app/dto/user.dto.js';
import { toPagedResult } from '#src/shared/utils/filters.js';

export class ListUsersCtrl {
  constructor(private readonly useCase: ListUsersUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await ListUsersCommand.create({ ...req.query, authUser: req.user });
      const { data, total } = await this.useCase.run(command);
      res.status(200).json(toPagedResult(data.map(toUserDto), total, command));
    } catch (error) {
      next(error);
    }
  };
}
