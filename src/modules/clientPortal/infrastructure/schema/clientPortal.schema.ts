import { z } from 'zod';

export const trackDeliverySchema = z.object({
  body: z.object({}),
  params: z.object({
    trackingNumber: z.string().min(1).max(20),
  }),
  query: z.object({
    verificationValue: z.string().min(1).max(20),
  }),
});

export const listMyDeliveriesSchema = z.object({
  body: z.object({}),
  params: z.object({
    trackingNumber: z.string().min(1).max(20),
  }),
  query: z.object({
    verificationValue: z.string().min(1).max(20),
  }),
});
