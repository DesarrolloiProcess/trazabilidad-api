import type { NextFunction, Request, Response } from 'express';
import { UpdatePatientCommand } from '#src/modules/patient/app/useCases/updatePatient/updatePatient.command.js';
import type { UpdatePatientUseCase } from '#src/modules/patient/app/useCases/updatePatient/updatePatient.useCase.js';
import { toPatientDto } from '#src/modules/patient/app/dto/patient.dto.js';

export class UpdatePatientCtrl {
  constructor(private readonly useCase: UpdatePatientUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await UpdatePatientCommand.create({ ...req.body, id: req.params.id, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(200).json(toPatientDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
