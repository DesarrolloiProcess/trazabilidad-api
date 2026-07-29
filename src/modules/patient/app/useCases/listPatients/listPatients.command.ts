import { IsInt, Min, Max } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class ListPatientsCommand extends AuthenticatedCommand {
  @IsInt()
  @Min(1)
  page!: number;

  @IsInt()
  @Min(1)
  @Max(100)
  limit!: number;
}
