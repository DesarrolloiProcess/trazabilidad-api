import type { NextFunction, Request, Response } from 'express';
import { GetUserByIdCommand } from '#src/modules/user/app/useCases/getUserById/getUserById.command.js';
import type { GetUserByIdUseCase } from '#src/modules/user/app/useCases/getUserById/getUserById.useCase.js';
import { toUserDto } from '#src/modules/user/app/dto/user.dto.js';

export class GetUserByIdCtrl {
  constructor(private readonly useCase: GetUserByIdUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await GetUserByIdCommand.create({ id: req.params.id, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(200).json(toUserDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
