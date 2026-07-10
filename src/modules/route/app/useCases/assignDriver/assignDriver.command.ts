import { IsUUID } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class AssignDriverCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;

  @IsUUID()
  driverId!: string;
}
