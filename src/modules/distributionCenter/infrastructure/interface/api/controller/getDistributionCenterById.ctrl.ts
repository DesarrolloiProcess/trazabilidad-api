import type { NextFunction, Request, Response } from 'express';
import { GetDistributionCenterByIdCommand } from '#src/modules/distributionCenter/app/useCases/getDistributionCenterById/getDistributionCenterById.command.js';
import type { GetDistributionCenterByIdUseCase } from '#src/modules/distributionCenter/app/useCases/getDistributionCenterById/getDistributionCenterById.useCase.js';
import { toDistributionCenterDto } from '#src/modules/distributionCenter/app/dto/distributionCenter.dto.js';

export class GetDistributionCenterByIdCtrl {
  constructor(private readonly useCase: GetDistributionCenterByIdUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await GetDistributionCenterByIdCommand.create({ id: req.params.id, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(200).json(toDistributionCenterDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
