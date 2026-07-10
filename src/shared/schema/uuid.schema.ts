import { z } from 'zod';
import { REGEX } from '#src/shared/constant/regex.constant.js';

export const uuidSchema = z.string().regex(REGEX.UUID, 'Debe ser un UUID válido');

export const uuidParamSchema = z.object({
  id: uuidSchema,
});
