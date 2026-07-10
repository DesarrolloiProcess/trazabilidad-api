import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { BaseCommand } from '#src/shared/commands/baseCommand.js';

export class LoginCommand extends BaseCommand {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
