import type { NextFunction, Request, Response } from 'express';
import { ListRoutesCommand } from '#src/modules/route/app/useCases/listRoutes/listRoutes.command.js';
import type { ListRoutesUseCase } from '#src/modules/route/app/useCases/listRoutes/listRoutes.useCase.js';
import { toRouteDto } from '#src/modules/route/app/dto/route.dto.js';
import { toPagedResult } from '#src/shared/utils/filters.js';

export class ListRoutesCtrl {
  constructor(private readonly useCase: ListRoutesUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await ListRoutesCommand.create({ ...req.query, authUser: req.user });
      const { data, total } = await this.useCase.run(command);
      res.status(200).json(toPagedResult(data.map(toRouteDto), total, command));
    } catch (error) {
      next(error);
    }
  };
}
