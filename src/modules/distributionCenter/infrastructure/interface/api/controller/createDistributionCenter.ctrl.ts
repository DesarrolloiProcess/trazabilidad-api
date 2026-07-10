import type { NextFunction, Request, Response } from 'express';
import { CreateDistributionCenterCommand } from '#src/modules/distributionCenter/app/useCases/createDistributionCenter/createDistributionCenter.command.js';
import type { CreateDistributionCenterUseCase } from '#src/modules/distributionCenter/app/useCases/createDistributionCenter/createDistributionCenter.useCase.js';
import { toDistributionCenterDto } from '#src/modules/distributionCenter/app/dto/distributionCenter.dto.js';

export class CreateDistributionCenterCtrl {
  constructor(private readonly useCase: CreateDistributionCenterUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await CreateDistributionCenterCommand.create({ ...req.body, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(201).json(toDistributionCenterDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
