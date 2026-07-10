import { z } from 'zod';

export const portalLoginSchema = z.object({
  trackingNumber: z.string().min(1, 'Ingresa tu número de guía').max(20),
  verificationValue: z.string().min(1, 'Ingresa tu teléfono o documento').max(20),
});

export type PortalLoginFormValues = z.infer<typeof portalLoginSchema>;
