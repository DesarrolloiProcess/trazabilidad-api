import type { Delivery } from '#src/modules/delivery/domain/delivery.entity.js';
import type { Client } from '#src/modules/client/domain/client.entity.js';
import type { Patient } from '#src/modules/patient/domain/patient.entity.js';

export function isClientAccessVerified(
  verificationValue: string,
  delivery: Delivery,
  client: Client | null,
  patient: Patient | null = null,
): boolean {
  return (
    verificationValue === delivery.recipientPhone ||
    (delivery.receiverIdNumber !== null && verificationValue === delivery.receiverIdNumber) ||
    (client !== null && verificationValue === client.nit) ||
    (patient !== null && patient.email !== null && verificationValue.toLowerCase() === patient.email.toLowerCase())
  );
}
