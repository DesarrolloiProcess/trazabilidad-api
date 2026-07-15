import type { NextFunction, Request, Response } from 'express';
import { MarkDeliveryInvoicedCommand } from '#src/modules/delivery/app/useCases/markDeliveryInvoiced/markDeliveryInvoiced.command.js';
import type { MarkDeliveryInvoicedUseCase } from '#src/modules/delivery/app/useCases/markDeliveryInvoiced/markDeliveryInvoiced.useCase.js';
import { toDeliveryDto } from '#src/modules/delivery/app/dto/delivery.dto.js';

export class MarkDeliveryInvoicedCtrl {
  constructor(private readonly useCase: MarkDeliveryInvoicedUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await MarkDeliveryInvoicedCommand.create({ id: req.params.id, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(200).json(toDeliveryDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
