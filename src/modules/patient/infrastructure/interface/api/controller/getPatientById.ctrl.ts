import type { NextFunction, Request, Response } from 'express';
import { GetPatientByIdCommand } from '#src/modules/patient/app/useCases/getPatientById/getPatientById.command.js';
import type { GetPatientByIdUseCase } from '#src/modules/patient/app/useCases/getPatientById/getPatientById.useCase.js';
import { toPatientDto } from '#src/modules/patient/app/dto/patient.dto.js';

export class GetPatientByIdCtrl {
  constructor(private readonly useCase: GetPatientByIdUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await GetPatientByIdCommand.create({ id: req.params.id, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(200).json(toPatientDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
