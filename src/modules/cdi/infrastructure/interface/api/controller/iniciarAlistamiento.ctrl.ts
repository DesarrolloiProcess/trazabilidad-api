import type { NextFunction, Request, Response } from 'express';
import { IniciarAlistamientoCommand } from '#src/modules/cdi/app/useCases/iniciarAlistamiento/iniciarAlistamiento.command.js';
import type { IniciarAlistamientoUseCase } from '#src/modules/cdi/app/useCases/iniciarAlistamiento/iniciarAlistamiento.useCase.js';

export class IniciarAlistamientoCtrl {
  constructor(private readonly useCase: IniciarAlistamientoUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await IniciarAlistamientoCommand.create({ id: req.params.id, authUser: req.user });
      await this.useCase.run(command);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
