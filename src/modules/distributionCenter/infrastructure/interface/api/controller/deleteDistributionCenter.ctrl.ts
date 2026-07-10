import type { NextFunction, Request, Response } from 'express';
import { DeleteDistributionCenterCommand } from '#src/modules/distributionCenter/app/useCases/deleteDistributionCenter/deleteDistributionCenter.command.js';
import type { DeleteDistributionCenterUseCase } from '#src/modules/distributionCenter/app/useCases/deleteDistributionCenter/deleteDistributionCenter.useCase.js';

export class DeleteDistributionCenterCtrl {
  constructor(private readonly useCase: DeleteDistributionCenterUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await DeleteDistributionCenterCommand.create({ id: req.params.id, authUser: req.user });
      await this.useCase.run(command);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
