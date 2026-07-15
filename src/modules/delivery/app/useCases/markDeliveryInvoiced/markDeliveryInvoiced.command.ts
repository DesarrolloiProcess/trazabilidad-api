import { IsUUID } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class MarkDeliveryInvoicedCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;
}
