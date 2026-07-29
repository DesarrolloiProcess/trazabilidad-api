import type { NextFunction, Request, Response } from 'express';
import { CreatePatientCommand } from '#src/modules/patient/app/useCases/createPatient/createPatient.command.js';
import type { CreatePatientUseCase } from '#src/modules/patient/app/useCases/createPatient/createPatient.useCase.js';
import { toPatientDto } from '#src/modules/patient/app/dto/patient.dto.js';

export class CreatePatientCtrl {
  constructor(private readonly useCase: CreatePatientUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await CreatePatientCommand.create({ ...req.body, authUser: req.user });
      const entity = await this.useCase.run(command);
      res.status(201).json(toPatientDto(entity));
    } catch (error) {
      next(error);
    }
  };
}
