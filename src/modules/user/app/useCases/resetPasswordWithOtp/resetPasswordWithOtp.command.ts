import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { BaseCommand } from '#src/shared/commands/baseCommand.js';

export class ResetPasswordWithOtpCommand extends BaseCommand {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  otpCode!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  newPassword!: string;
}
