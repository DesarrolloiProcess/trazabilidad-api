import type { NextFunction, Request, Response } from 'express';
import { UpdateUserCommand } from '#src/modules/user/app/useCases/updateUser/updateUser.command.js';
import type { UpdateUserUseCase } from '#src/modules/user/app/useCases/updateUser/updateUser.useCase.js';
import { toUserDto } from '#src/modules/user/app/dto/user.dto.js';

export class UpdateUserCtrl {
  constructor(private readonly useCase: UpdateUserUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await UpdateUserCommand.create({ ...req.body, id: req.params.id, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(200).json(toUserDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
