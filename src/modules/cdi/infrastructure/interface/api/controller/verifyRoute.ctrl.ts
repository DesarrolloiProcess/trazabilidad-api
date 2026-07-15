import type { NextFunction, Request, Response } from 'express';
import { VerifyRouteCommand } from '#src/modules/cdi/app/useCases/verifyRoute/verifyRoute.command.js';
import type { VerifyRouteUseCase } from '#src/modules/cdi/app/useCases/verifyRoute/verifyRoute.useCase.js';

export class VerifyRouteCtrl {
  constructor(private readonly useCase: VerifyRouteUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await VerifyRouteCommand.create({ id: req.params.id, authUser: req.user });
      const result = await this.useCase.run(command);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
