import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';
import type { Patient } from '#src/modules/patient/domain/patient.entity.js';

export interface IPatientQuery {
  page: number;
  limit: number;
}

export interface IPatientRepository {
  getMany(query: IPatientQuery): Promise<{ data: Patient[]; total: number }>;
  getById(id: string): Promise<Patient | null>;
  getByPhone(phone: string): Promise<Patient | null>;
  create(entity: Patient, config?: { tx?: ITransaction }): Promise<Patient>;
  update(entity: Patient, config?: { tx?: ITransaction }): Promise<Patient>;
}
