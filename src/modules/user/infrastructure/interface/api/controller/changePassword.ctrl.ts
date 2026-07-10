import type { NextFunction, Request, Response } from 'express';
import { ChangePasswordCommand } from '#src/modules/user/app/useCases/changePassword/changePassword.command.js';
import type { ChangePasswordUseCase } from '#src/modules/user/app/useCases/changePassword/changePassword.useCase.js';

export class ChangePasswordCtrl {
  constructor(private readonly useCase: ChangePasswordUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await ChangePasswordCommand.create({ ...req.body, authUser: req.user });
      await this.useCase.run(command);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
