import type { NextFunction, Request, Response } from 'express';
import { ResetPasswordWithOtpCommand } from '#src/modules/user/app/useCases/resetPasswordWithOtp/resetPasswordWithOtp.command.js';
import type { ResetPasswordWithOtpUseCase } from '#src/modules/user/app/useCases/resetPasswordWithOtp/resetPasswordWithOtp.useCase.js';

export class ResetPasswordWithOtpCtrl {
  constructor(private readonly useCase: ResetPasswordWithOtpUseCase) {}

  run = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const command = await ResetPasswordWithOtpCommand.create(req.body);
      await this.useCase.run(command);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
