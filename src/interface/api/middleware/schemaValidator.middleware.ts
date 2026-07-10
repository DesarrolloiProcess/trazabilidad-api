import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { ValidationError } from '#src/shared/Errors/validationError.js';

function trimDeep<T>(value: T): T {
  if (typeof value === 'string') {
    return value.trim() as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => trimDeep(item)) as unknown as T;
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, val]) => [key, trimDeep(val)]);
    return Object.fromEntries(entries) as T;
  }

  return value;
}

export function schemaValidation(schema: ZodTypeAny): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse({
      body: trimDeep(req.body),
      params: trimDeep(req.params),
      query: trimDeep(req.query),
    });

    if (!parsed.success) {
      next(new ValidationError('Error de validación en la petición', parsed.error.flatten()));
      return;
    }

    req.body = parsed.data.body ?? req.body;
    req.params = parsed.data.params ?? req.params;
    req.query = parsed.data.query ?? req.query;
    next();
  };
}
