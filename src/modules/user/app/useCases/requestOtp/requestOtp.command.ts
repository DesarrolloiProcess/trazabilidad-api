import { IsEmail } from 'class-validator';
import { BaseCommand } from '#src/shared/commands/baseCommand.js';

export class RequestOtpCommand extends BaseCommand {
  @IsEmail()
  email!: string;
}
