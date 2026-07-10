import { z } from 'zod';

export const importTxtPlanillaSchema = z.object({
  body: z.object({
    content: z.string().min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});
