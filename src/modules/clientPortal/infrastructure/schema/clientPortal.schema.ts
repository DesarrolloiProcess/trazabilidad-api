import { z } from 'zod';

export const trackDeliverySchema = z.object({
  body: z.object({}),
  params: z.object({
    trackingNumber: z.string().min(1).max(20),
  }),
  query: z.object({
    // Hasta 150: telefono/documento son cortos, pero un correo (ahora tambien valido) puede ser mas largo.
    verificationValue: z.string().min(1).max(150),
  }),
});

export const listMyDeliveriesSchema = z.object({
  body: z.object({}),
  params: z.object({
    trackingNumber: z.string().min(1).max(20),
  }),
  query: z.object({
    // Hasta 150: telefono/documento son cortos, pero un correo (ahora tambien valido) puede ser mas largo.
    verificationValue: z.string().min(1).max(150),
  }),
});
