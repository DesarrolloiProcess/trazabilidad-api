import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEmail } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class CreatePatientCommand extends AuthenticatedCommand {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  documentNumber?: string;
}
