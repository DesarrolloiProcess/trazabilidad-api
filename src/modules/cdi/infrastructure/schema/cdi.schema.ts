import { z } from 'zod';
import { uuidSchema } from '#src/shared/schema/uuid.schema.js';

export const listPendingVerificationSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    distributionCenterId: uuidSchema,
  }),
});

export const verifyRouteSchema = z.object({
  body: z.object({
    signatureUrl: z.string().min(1),
  }),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});

export const startVerificationSchema = z.object({
  body: z.object({}),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});
