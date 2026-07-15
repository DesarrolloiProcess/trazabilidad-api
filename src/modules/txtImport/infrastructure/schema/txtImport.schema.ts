import { z } from 'zod';
import { uuidSchema } from '#src/shared/schema/uuid.schema.js';

export const importTxtPlanillaSchema = z.object({
  body: z.object({
    content: z.string().min(1),
    distributionCenterId: uuidSchema.optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});
