import type { NextFunction, Request, Response } from 'express';
import { AppError } from '#src/shared/Errors/appError.js';
import { CommandError } from '#src/shared/Errors/commandError.js';

export function customErrorHandle(error: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof CommandError) {
    res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Ha ocurrido un error inesperado',
  });
}
