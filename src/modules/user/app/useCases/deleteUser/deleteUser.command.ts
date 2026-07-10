import { IsUUID } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class DeleteUserCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;
}
