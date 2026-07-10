import type { NextFunction, Request, Response } from 'express';
import { MarkNotDeliveredCommand } from '#src/modules/delivery/app/useCases/markNotDelivered/markNotDelivered.command.js';
import type { MarkNotDeliveredUseCase } from '#src/modules/delivery/app/useCases/markNotDelivered/markNotDelivered.useCase.js';
import { toDeliveryDto } from '#src/modules/delivery/app/dto/delivery.dto.js';

export class MarkNotDeliveredCtrl {
  constructor(private readonly useCase: MarkNotDeliveredUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await MarkNotDeliveredCommand.create({ ...req.body, id: req.params.id, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(200).json(toDeliveryDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
