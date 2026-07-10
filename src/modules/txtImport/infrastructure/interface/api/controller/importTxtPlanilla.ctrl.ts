import type { NextFunction, Request, Response } from 'express';
import { ImportTxtPlanillaCommand } from '#src/modules/txtImport/app/useCases/importTxtPlanilla/importTxtPlanilla.command.js';
import type { ImportTxtPlanillaUseCase } from '#src/modules/txtImport/app/useCases/importTxtPlanilla/importTxtPlanilla.useCase.js';

export class ImportTxtPlanillaCtrl {
  constructor(private readonly useCase: ImportTxtPlanillaUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await ImportTxtPlanillaCommand.create({ ...req.body, authUser: req.user });
      const result = await this.useCase.run(command);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
