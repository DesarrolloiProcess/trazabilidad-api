import { z } from 'zod';
import { uuidSchema } from '#src/shared/schema/uuid.schema.js';
import { paginationSchema } from '#src/shared/schema/pagination.schema.js';

export const getDeliveryByIdSchema = z.object({
  body: z.object({}),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});

export const listDeliveriesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: paginationSchema.extend({
    routeId: uuidSchema.optional(),
  }),
});

export const advanceDeliveryStatusSchema = z.object({
  body: z.object({
    status: z.enum(['alistado', 'entregado_transportador']),
  }),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});

export const deliveryEvidenceSchema = z.object({
  body: z.object({
    signatureUrl: z.string().min(1),
    photoUrl: z.string().min(1),
    receiverName: z.string().min(1).max(150),
    receiverIdNumber: z.string().min(1).max(20),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
  }),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});

export const markNotDeliveredSchema = z.object({
  body: z.object({
    observation: z.string().min(1).max(500),
  }),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});

export const invoiceExportSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    from: z.string().datetime().or(z.string().date()),
    to: z.string().datetime().or(z.string().date()),
  }),
});

export const markDeliveryInvoicedSchema = z.object({
  body: z.object({}),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});
