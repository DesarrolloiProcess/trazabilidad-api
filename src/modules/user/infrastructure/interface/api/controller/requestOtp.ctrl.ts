import type { NextFunction, Request, Response } from 'express';
import { RequestOtpCommand } from '#src/modules/user/app/useCases/requestOtp/requestOtp.command.js';
import type { RequestOtpUseCase } from '#src/modules/user/app/useCases/requestOtp/requestOtp.useCase.js';

export class RequestOtpCtrl {
  constructor(private readonly useCase: RequestOtpUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await RequestOtpCommand.create(req.body);
      const result = await this.useCase.run(command);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
