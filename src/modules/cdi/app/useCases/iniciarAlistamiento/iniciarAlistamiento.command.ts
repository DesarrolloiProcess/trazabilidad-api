import { IsUUID } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class IniciarAlistamientoCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;
}
