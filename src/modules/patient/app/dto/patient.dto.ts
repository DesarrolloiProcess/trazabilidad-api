import type { Patient } from '#src/modules/patient/domain/patient.entity.js';

export interface PatientDto {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  documentNumber: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toPatientDto(entity: Patient): PatientDto {
  return {
    id: entity.id,
    name: entity.name,
    phone: entity.phone,
    email: entity.email,
    documentNumber: entity.documentNumber,
    active: entity.active,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
