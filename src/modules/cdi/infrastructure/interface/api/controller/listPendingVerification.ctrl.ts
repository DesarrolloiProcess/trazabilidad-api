import type { NextFunction, Request, Response } from 'express';
import { ListPendingVerificationCommand } from '#src/modules/cdi/app/useCases/listPendingVerification/listPendingVerification.command.js';
import type { ListPendingVerificationUseCase } from '#src/modules/cdi/app/useCases/listPendingVerification/listPendingVerification.useCase.js';

export class ListPendingVerificationCtrl {
  constructor(private readonly useCase: ListPendingVerificationUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await ListPendingVerificationCommand.create({ ...req.query, authUser: req.user });
      const result = await this.useCase.run(command);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
