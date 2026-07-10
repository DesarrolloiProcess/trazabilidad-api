import type { NextFunction, Request, Response } from 'express';
import { InvoiceExportCommand } from '#src/modules/delivery/app/useCases/invoiceExport/invoiceExport.command.js';
import type { InvoiceExportUseCase } from '#src/modules/delivery/app/useCases/invoiceExport/invoiceExport.useCase.js';

export class InvoiceExportCtrl {
  constructor(private readonly useCase: InvoiceExportUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await InvoiceExportCommand.create({ ...req.query, authUser: req.user });
      const result = await this.useCase.run(command);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
