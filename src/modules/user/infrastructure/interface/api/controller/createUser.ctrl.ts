import type { NextFunction, Request, Response } from 'express';
import { CreateUserCommand } from '#src/modules/user/app/useCases/createUser/createUser.command.js';
import type { CreateUserUseCase } from '#src/modules/user/app/useCases/createUser/createUser.useCase.js';
import { toUserDto } from '#src/modules/user/app/dto/user.dto.js';

export class CreateUserCtrl {
  constructor(private readonly useCase: CreateUserUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await CreateUserCommand.create({ ...req.body, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(201).json(toUserDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
