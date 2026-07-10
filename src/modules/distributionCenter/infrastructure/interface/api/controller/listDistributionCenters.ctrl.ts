import type { NextFunction, Request, Response } from 'express';
import { ListDistributionCentersCommand } from '#src/modules/distributionCenter/app/useCases/listDistributionCenters/listDistributionCenters.command.js';
import type { ListDistributionCentersUseCase } from '#src/modules/distributionCenter/app/useCases/listDistributionCenters/listDistributionCenters.useCase.js';
import { toDistributionCenterDto } from '#src/modules/distributionCenter/app/dto/distributionCenter.dto.js';
import { toPagedResult } from '#src/shared/utils/filters.js';

export class ListDistributionCentersCtrl {
  constructor(private readonly useCase: ListDistributionCentersUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await ListDistributionCentersCommand.create({ ...req.query, authUser: req.user });
      const { data, total } = await this.useCase.run(command);
      res.status(200).json(toPagedResult(data.map(toDistributionCenterDto), total, command));
    } catch (error) {
      next(error);
    }
  };
}
