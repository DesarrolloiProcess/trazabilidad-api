import { IsUUID } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class GetDistributionCenterByIdCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;
}
