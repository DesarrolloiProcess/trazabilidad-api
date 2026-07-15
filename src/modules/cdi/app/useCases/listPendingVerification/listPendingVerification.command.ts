import { IsUUID } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class ListPendingVerificationCommand extends AuthenticatedCommand {
  @IsUUID()
  distributionCenterId!: string;
}
