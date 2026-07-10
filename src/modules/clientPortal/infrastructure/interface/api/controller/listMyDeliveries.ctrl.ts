import type { NextFunction, Request, Response } from 'express';
import { ListMyDeliveriesCommand } from '#src/modules/clientPortal/app/useCases/listMyDeliveries/listMyDeliveries.command.js';
import type { ListMyDeliveriesUseCase } from '#src/modules/clientPortal/app/useCases/listMyDeliveries/listMyDeliveries.useCase.js';

export class ListMyDeliveriesCtrl {
  constructor(private readonly useCase: ListMyDeliveriesUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await ListMyDeliveriesCommand.create({
        trackingNumber: req.params.trackingNumber,
        verificationValue: req.query.verificationValue,
      });
      const result = await this.useCase.run(command);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
