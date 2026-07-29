import type { NextFunction, Request, Response } from 'express';
import { ListPatientsCommand } from '#src/modules/patient/app/useCases/listPatients/listPatients.command.js';
import type { ListPatientsUseCase } from '#src/modules/patient/app/useCases/listPatients/listPatients.useCase.js';
import { toPatientDto } from '#src/modules/patient/app/dto/patient.dto.js';
import { toPagedResult } from '#src/shared/utils/filters.js';

export class ListPatientsCtrl {
  constructor(private readonly useCase: ListPatientsUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await ListPatientsCommand.create({ ...req.query, authUser: req.user });
      const { data, total } = await this.useCase.run(command);
      res.status(200).json(toPagedResult(data.map(toPatientDto), total, command));
    } catch (error) {
      next(error);
    }
  };
}
