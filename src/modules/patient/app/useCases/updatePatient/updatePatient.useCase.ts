import { EntityNotFoundError } from '#src/shared/Errors/entityNotFoundError.js';
import { BusinessLogicError } from '#src/shared/Errors/businessLogicError.js';
import type { Patient } from '#src/modules/patient/domain/patient.entity.js';
import type { IPatientRepository } from '#src/modules/patient/domain/patient.repository.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { UpdatePatientCommand } from '#src/modules/patient/app/useCases/updatePatient/updatePatient.command.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

export class UpdatePatientUseCase {
  constructor(
    private readonly repository: IPatientRepository,
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async run(command: UpdatePatientCommand, transaction?: ITransaction): Promise<Patient> {
    const current = await this.repository.getById(command.id);

    if (!current) {
      throw new EntityNotFoundError('Paciente', command.id);
    }

    if (command.phone && command.phone !== current.phone) {
      const existing = await this.repository.getByPhone(command.phone);
      if (existing && existing.id !== current.id) {
        throw new BusinessLogicError(`Ya existe un paciente registrado con el teléfono ${command.phone}`);
      }
    }

    let updated = current.update(
      { name: command.name, phone: command.phone, email: command.email, documentNumber: command.documentNumber },
      command.authUser.id,
    );

    if (command.active !== undefined) {
      updated = command.active ? updated.activate(command.authUser.id) : updated.deactivate(command.authUser.id);
    }

    const saved = await this.repository.update(updated, { tx: transaction });

    // El telefono ya se guardo en cada guia al importarla (no se lee del paciente en tiempo real) —
    // si el ADMIN lo corrige aqui, se propaga a las guias existentes para que no queden desactualizadas.
    if (saved.phone && saved.phone !== current.phone) {
      await this.deliveryRepository.updateRecipientPhoneByPatientId(saved.id, saved.phone, { tx: transaction });
    }

    return saved;
  }
}
