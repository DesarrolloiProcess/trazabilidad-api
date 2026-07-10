import type { NextFunction, Request, Response } from 'express';
import { DeliveryEvidenceCommand } from '#src/modules/delivery/app/useCases/deliveryEvidence/deliveryEvidence.command.js';
import type { DeliveryEvidenceUseCase } from '#src/modules/delivery/app/useCases/deliveryEvidence/deliveryEvidence.useCase.js';
import { toDeliveryDto } from '#src/modules/delivery/app/dto/delivery.dto.js';

export class DeliveryEvidenceCtrl {
  constructor(private readonly useCase: DeliveryEvidenceUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await DeliveryEvidenceCommand.create({ ...req.body, id: req.params.id, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(200).json(toDeliveryDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
