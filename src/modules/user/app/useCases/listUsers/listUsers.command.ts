import { IsInt, Min, Max, IsEnum, IsOptional } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';
import { Role } from '#src/shared/constant/roles.constant.js';

export class ListUsersCommand extends AuthenticatedCommand {
  @IsInt()
  @Min(1)
  page!: number;

  @IsInt()
  @Min(1)
  @Max(100)
  limit!: number;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
