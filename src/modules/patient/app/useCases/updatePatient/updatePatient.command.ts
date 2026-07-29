import { IsString, IsNotEmpty, MaxLength, IsUUID, IsOptional, IsBoolean, IsEmail } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class UpdatePatientCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

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

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
