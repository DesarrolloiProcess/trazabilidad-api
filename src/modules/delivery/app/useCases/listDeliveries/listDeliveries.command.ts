import { IsInt, Min, Max, IsOptional, IsUUID } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class ListDeliveriesCommand extends AuthenticatedCommand {
  @IsInt()
  @Min(1)
  page!: number;

  @IsInt()
  @Min(1)
  @Max(500)
  limit!: number;

  @IsOptional()
  @IsUUID()
  routeId?: string;
}
