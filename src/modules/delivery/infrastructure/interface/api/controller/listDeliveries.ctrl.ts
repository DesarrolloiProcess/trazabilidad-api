import type { NextFunction, Request, Response } from 'express';
import { ListDeliveriesCommand } from '#src/modules/delivery/app/useCases/listDeliveries/listDeliveries.command.js';
import type { ListDeliveriesUseCase } from '#src/modules/delivery/app/useCases/listDeliveries/listDeliveries.useCase.js';
import { toDeliveryDto } from '#src/modules/delivery/app/dto/delivery.dto.js';
import { toPagedResult } from '#src/shared/utils/filters.js';

export class ListDeliveriesCtrl {
  constructor(private readonly useCase: ListDeliveriesUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await ListDeliveriesCommand.create({ ...req.query, authUser: req.user });
      const { data, total } = await this.useCase.run(command);
      res.status(200).json(toPagedResult(data.map(toDeliveryDto), total, command));
    } catch (error) {
      next(error);
    }
  };
}
