import type { NextFunction, Request, Response } from 'express';
import { DeleteUserCommand } from '#src/modules/user/app/useCases/deleteUser/deleteUser.command.js';
import type { DeleteUserUseCase } from '#src/modules/user/app/useCases/deleteUser/deleteUser.useCase.js';

export class DeleteUserCtrl {
  constructor(private readonly useCase: DeleteUserUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await DeleteUserCommand.create({ id: req.params.id, authUser: req.user });
      await this.useCase.run(command);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
