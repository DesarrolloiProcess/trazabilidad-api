import type { NextFunction, Request, Response } from 'express';
import { AssignDriverCommand } from '#src/modules/route/app/useCases/assignDriver/assignDriver.command.js';
import type { AssignDriverUseCase } from '#src/modules/route/app/useCases/assignDriver/assignDriver.useCase.js';
import { toRouteDto } from '#src/modules/route/app/dto/route.dto.js';

export class AssignDriverCtrl {
  constructor(private readonly useCase: AssignDriverUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await AssignDriverCommand.create({ ...req.body, id: req.params.id, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(200).json(toRouteDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
