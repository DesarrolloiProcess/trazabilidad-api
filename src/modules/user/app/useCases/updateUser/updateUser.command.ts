import { IsString, IsNotEmpty, MaxLength, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';
import { Role } from '#src/shared/constant/roles.constant.js';

export class UpdateUserCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;

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
