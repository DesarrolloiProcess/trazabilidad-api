import type { NextFunction, Request, Response } from 'express';
import { GetRouteByIdCommand } from '#src/modules/route/app/useCases/getRouteById/getRouteById.command.js';
import type { GetRouteByIdUseCase } from '#src/modules/route/app/useCases/getRouteById/getRouteById.useCase.js';
import { toRouteDto } from '#src/modules/route/app/dto/route.dto.js';

export class GetRouteByIdCtrl {
  constructor(private readonly useCase: GetRouteByIdUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await GetRouteByIdCommand.create({ id: req.params.id, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(200).json(toRouteDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
