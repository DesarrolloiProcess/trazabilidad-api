import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import type { Patient } from '#src/modules/patient/domain/patient.entity.js';
import type { IPatientRepository } from '#src/modules/patient/domain/patient.repository.js';
import type { GetPatientByIdCommand } from '#src/modules/patient/app/useCases/getPatientById/getPatientById.command.js';

export class GetPatientByIdUseCase {
  constructor(private readonly repository: IPatientRepository) {}

  async run(command: GetPatientByIdCommand): Promise<Patient> {
    const entity = await this.repository.getById(command.id);

    if (!entity) {
      throw new EntityNotFoundError('Paciente', command.id);
    }

    return entity;
  }
}
