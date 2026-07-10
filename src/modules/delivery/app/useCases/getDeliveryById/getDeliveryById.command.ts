import { IsUUID } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class GetDeliveryByIdCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;
}
