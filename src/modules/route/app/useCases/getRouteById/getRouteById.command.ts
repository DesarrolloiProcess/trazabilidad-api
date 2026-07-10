import { IsUUID } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class GetRouteByIdCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;
}
