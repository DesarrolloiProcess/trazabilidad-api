import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';
import { Role } from '#src/shared/constant/roles.constant.js';

export class CreateUserCommand extends AuthenticatedCommand {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsUUID()
  distributionCenterId?: string;
}
