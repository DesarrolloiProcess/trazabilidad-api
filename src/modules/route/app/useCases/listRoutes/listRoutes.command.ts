import { IsInt, Min, Max, IsOptional, IsUUID } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class ListRoutesCommand extends AuthenticatedCommand {
  @IsInt()
  @Min(1)
  page!: number;

  @IsInt()
  @Min(1)
  @Max(100)
  limit!: number;

  @IsOptional()
  @IsUUID()
  distributionCenterId?: string;

  @IsOptional()
  @IsUUID()
  driverId?: string;
}
