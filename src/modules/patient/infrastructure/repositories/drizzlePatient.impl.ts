import { eq, count } from 'drizzle-orm';
import { drizzleOrm } from '#src/shared/lib/drizzle/connection.js';
import { patients } from '#src/shared/lib/drizzle/models/patient.schema.js';
import { Patient } from '#src/modules/patient/domain/patient.entity.js';
import type { IPatientQuery, IPatientRepository } from '#src/modules/patient/domain/patient.repository.js';
import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';

type PatientRow = typeof patients.$inferSelect;

function toEntity(row: PatientRow): Patient {
  return new Patient({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    documentNumber: row.document_number,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  });
}

export class DrizzlePatientImpl implements IPatientRepository {
  async getMany(query: IPatientQuery): Promise<{ data: Patient[]; total: number }> {
    const offset = (query.page - 1) * query.limit;

    const [rows, [{ total }]] = await Promise.all([
      drizzleOrm().select().from(patients).limit(query.limit).offset(offset),
      drizzleOrm().select({ total: count() }).from(patients),
    ]);

    return { data: rows.map(toEntity), total };
  }

  async getById(id: string): Promise<Patient | null> {
    const [row] = await drizzleOrm().select().from(patients).where(eq(patients.id, id)).limit(1);

    return row ? toEntity(row) : null;
  }

  async getByPhone(phone: string): Promise<Patient | null> {
    const [row] = await drizzleOrm().select().from(patients).where(eq(patients.phone, phone)).limit(1);

    return row ? toEntity(row) : null;
  }

  async create(entity: Patient, config?: { tx?: ITransaction }): Promise<Patient> {
    const executor = config?.tx ?? drizzleOrm();

    await executor.insert(patients).values({
      id: entity.id,
      name: entity.name,
      phone: entity.phone,
      email: entity.email,
      document_number: entity.documentNumber,
      active: entity.active,
      created_by: entity.createdBy,
      updated_by: entity.updatedBy,
    });

    return entity;
  }

  async update(entity: Patient, config?: { tx?: ITransaction }): Promise<Patient> {
    const executor = config?.tx ?? drizzleOrm();

    await executor
      .update(patients)
      .set({
        name: entity.name,
        phone: entity.phone,
        email: entity.email,
        document_number: entity.documentNumber,
        active: entity.active,
        updated_by: entity.updatedBy,
      })
      .where(eq(patients.id, entity.id));

    return entity;
  }
}
