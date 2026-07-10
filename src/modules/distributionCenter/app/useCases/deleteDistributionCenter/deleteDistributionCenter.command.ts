import { IsUUID } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class DeleteDistributionCenterCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;
}
