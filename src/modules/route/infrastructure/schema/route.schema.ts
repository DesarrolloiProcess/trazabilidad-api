import { z } from 'zod';
import { uuidSchema } from '#src/shared/schema/uuid.schema.js';
import { paginationSchema } from '#src/shared/schema/pagination.schema.js';

export const getRouteByIdSchema = z.object({
  body: z.object({}),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});

export const listRoutesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: paginationSchema.extend({
    distributionCenterId: uuidSchema.optional(),
    driverId: uuidSchema.optional(),
  }),
});

export const updateRouteStatusSchema = z.object({
  body: z.object({
    status: z.enum(['creada', 'entregada_transportador', 'en_curso', 'completada', 'con_novedad']),
  }),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});
