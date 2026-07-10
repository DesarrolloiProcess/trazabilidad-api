import type { NextFunction, Request, Response } from 'express';
import { AdvanceDeliveryStatusCommand } from '#src/modules/delivery/app/useCases/advanceDeliveryStatus/advanceDeliveryStatus.command.js';
import type { AdvanceDeliveryStatusUseCase } from '#src/modules/delivery/app/useCases/advanceDeliveryStatus/advanceDeliveryStatus.useCase.js';
import { toDeliveryDto } from '#src/modules/delivery/app/dto/delivery.dto.js';

export class AdvanceDeliveryStatusCtrl {
  constructor(private readonly useCase: AdvanceDeliveryStatusUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await AdvanceDeliveryStatusCommand.create({ ...req.body, id: req.params.id, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(200).json(toDeliveryDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
