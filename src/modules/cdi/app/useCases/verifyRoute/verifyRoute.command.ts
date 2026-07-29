import { IsUUID, IsString, IsNotEmpty } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class VerifyRouteCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  signatureUrl!: string;
}
