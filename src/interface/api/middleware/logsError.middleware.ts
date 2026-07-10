import type { NextFunction, Request, Response } from 'express';

export function logsError(error: Error, _req: Request, _res: Response, next: NextFunction): void {
  console.error(`[${new Date().toISOString()}] ${error.name}: ${error.message}`);

  if (error.stack) {
    console.error(error.stack);
  }

  next(error);
}
