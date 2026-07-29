import { Patient } from '#src/modules/patient/domain/patient.entity.js';
import type { IPatientRepository } from '#src/modules/patient/domain/patient.repository.js';
import type { CreatePatientCommand } from '#src/modules/patient/app/useCases/createPatient/createPatient.command.js';
import type { IUuidRepository } from '#src/shared/helpers/uuidHandle/domain/uuidHandle.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';
import { BusinessLogicError } from '#src/shared/Errors/businessLogicError.js';

export class CreatePatientUseCase {
  constructor(
    private readonly repository: IPatientRepository,
    private readonly uuidHandle: IUuidRepository,
  ) {}

  async run(command: CreatePatientCommand, transaction?: ITransaction): Promise<Patient> {
    if (command.phone) {
      const existing = await this.repository.getByPhone(command.phone);
      if (existing) {
        throw new BusinessLogicError(`Ya existe un paciente registrado con el teléfono ${command.phone}`);
      }
    }

    const now = new Date();

    const entity = new Patient({
      id: this.uuidHandle.uuid(),
      name: command.name,
      phone: command.phone ?? null,
      email: command.email ?? null,
      documentNumber: command.documentNumber ?? null,
      active: true,
      createdAt: now,
      updatedAt: now,
      createdBy: command.authUser.id,
      updatedBy: command.authUser.id,
    });

    return this.repository.create(entity, { tx: transaction });
  }
}
