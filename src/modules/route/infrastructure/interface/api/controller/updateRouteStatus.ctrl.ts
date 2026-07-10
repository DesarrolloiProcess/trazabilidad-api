import type { NextFunction, Request, Response } from 'express';
import { UpdateRouteStatusCommand } from '#src/modules/route/app/useCases/updateRouteStatus/updateRouteStatus.command.js';
import type { UpdateRouteStatusUseCase } from '#src/modules/route/app/useCases/updateRouteStatus/updateRouteStatus.useCase.js';
import { toRouteDto } from '#src/modules/route/app/dto/route.dto.js';

export class UpdateRouteStatusCtrl {
  constructor(private readonly useCase: UpdateRouteStatusUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await UpdateRouteStatusCommand.create({ ...req.body, id: req.params.id, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(200).json(toRouteDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
