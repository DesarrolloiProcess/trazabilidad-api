import type { NextFunction, Request, Response } from 'express';
import { GetDeliveryByIdCommand } from '#src/modules/delivery/app/useCases/getDeliveryById/getDeliveryById.command.js';
import type { GetDeliveryByIdUseCase } from '#src/modules/delivery/app/useCases/getDeliveryById/getDeliveryById.useCase.js';
import { toDeliveryDto } from '#src/modules/delivery/app/dto/delivery.dto.js';

export class GetDeliveryByIdCtrl {
  constructor(private readonly useCase: GetDeliveryByIdUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await GetDeliveryByIdCommand.create({ id: req.params.id, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(200).json(toDeliveryDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
