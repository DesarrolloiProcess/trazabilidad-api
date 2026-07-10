import { IsDateString } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class InvoiceExportCommand extends AuthenticatedCommand {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}
