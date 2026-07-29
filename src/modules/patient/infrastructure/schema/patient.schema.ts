import { z } from 'zod';
import { uuidSchema } from '#src/shared/schema/uuid.schema.js';
import { paginationSchema } from '#src/shared/schema/pagination.schema.js';

export const createPatientSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150),
    phone: z.string().min(1).max(20).optional(),
    email: z.string().email().max(150).optional(),
    documentNumber: z.string().min(1).max(30).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updatePatientSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150).optional(),
    phone: z.string().min(1).max(20).optional(),
    email: z.string().email().max(150).optional(),
    documentNumber: z.string().min(1).max(30).optional(),
    active: z.boolean().optional(),
  }),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});

export const getPatientByIdSchema = z.object({
  body: z.object({}),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});

export const listPatientsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: paginationSchema,
});
