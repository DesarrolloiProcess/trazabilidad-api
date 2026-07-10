import type { NextFunction, Request, Response } from 'express';
import { UpdateDistributionCenterCommand } from '#src/modules/distributionCenter/app/useCases/updateDistributionCenter/updateDistributionCenter.command.js';
import type { UpdateDistributionCenterUseCase } from '#src/modules/distributionCenter/app/useCases/updateDistributionCenter/updateDistributionCenter.useCase.js';
import { toDistributionCenterDto } from '#src/modules/distributionCenter/app/dto/distributionCenter.dto.js';

export class UpdateDistributionCenterCtrl {
  constructor(private readonly useCase: UpdateDistributionCenterUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await UpdateDistributionCenterCommand.create({
        ...req.body,
        id: req.params.id,
        authUser: req.user,
      });
      const entity = await this.useCase.run(command);
      res.status(200).json(toDistributionCenterDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
