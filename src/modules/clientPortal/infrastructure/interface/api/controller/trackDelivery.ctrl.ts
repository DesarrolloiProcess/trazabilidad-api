import type { NextFunction, Request, Response } from 'express';
import { TrackDeliveryCommand } from '#src/modules/clientPortal/app/useCases/trackDelivery/trackDelivery.command.js';
import type { TrackDeliveryUseCase } from '#src/modules/clientPortal/app/useCases/trackDelivery/trackDelivery.useCase.js';

export class TrackDeliveryCtrl {
  constructor(private readonly useCase: TrackDeliveryUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await TrackDeliveryCommand.create({
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
