import type { Patient } from '#src/modules/patient/domain/patient.entity.js';
import type { IPatientRepository } from '#src/modules/patient/domain/patient.repository.js';
import type { ListPatientsCommand } from '#src/modules/patient/app/useCases/listPatients/listPatients.command.js';

export class ListPatientsUseCase {
  constructor(private readonly repository: IPatientRepository) {}

  async run(command: ListPatientsCommand): Promise<{ data: Patient[]; total: number }> {
    return this.repository.getMany({ page: command.page, limit: command.limit });
  }
}
