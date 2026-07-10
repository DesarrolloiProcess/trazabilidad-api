import type { NextFunction, Request, Response } from 'express';
import { LoginCommand } from '#src/modules/user/app/useCases/login/login.command.js';
import type { LoginUseCase } from '#src/modules/user/app/useCases/login/login.useCase.js';

export class LoginCtrl {
  constructor(private readonly useCase: LoginUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await LoginCommand.create(req.body);
      const result = await this.useCase.run(command);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
