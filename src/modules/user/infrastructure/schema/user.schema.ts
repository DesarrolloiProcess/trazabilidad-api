import { z } from 'zod';
import { uuidSchema } from '#src/shared/schema/uuid.schema.js';
import { paginationSchema } from '#src/shared/schema/pagination.schema.js';
import { Role } from '#src/shared/constant/roles.constant.js';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100).optional(),
    name: z.string().min(1).max(150),
    role: z.nativeEnum(Role),
    distributionCenterId: uuidSchema.optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150).optional(),
    role: z.nativeEnum(Role).optional(),
    distributionCenterId: uuidSchema.optional(),
    active: z.boolean().optional(),
  }),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});

export const deleteUserSchema = z.object({
  body: z.object({}),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});

export const getUserByIdSchema = z.object({
  body: z.object({}),
  params: z.object({ id: uuidSchema }),
  query: z.object({}),
});

export const listUsersSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: paginationSchema.extend({
    role: z.nativeEnum(Role).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const requestOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const resetPasswordWithOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otpCode: z.string().min(1),
    newPassword: z.string().min(8).max(100),
  }),
  params: z.object({}),
  query: z.object({}),
});
