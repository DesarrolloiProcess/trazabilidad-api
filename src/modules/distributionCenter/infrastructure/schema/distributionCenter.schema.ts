import { z } from 'zod';
import { uuidSchema } from '#src/shared/schema/uuid.schema.js';
import { paginationSchema } from '#src/shared/schema/pagination.schema.js';

export const createDistributionCenterSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150),
    city: z.string().min(1).max(100),
    address: z.string().min(1).max(255),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateDistributionCenterSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150).optional(),
    city: z.string().min(1).max(100).optional(),
    address: z.string().min(1).max(255).optional(),
    active: z.boolean().optional(),
  }),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});

export const getDistributionCenterByIdSchema = z.object({
  body: z.object({}),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});

export const deleteDistributionCenterSchema = z.object({
  body: z.object({}),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});

export const listDistributionCentersSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: paginationSchema,
});
