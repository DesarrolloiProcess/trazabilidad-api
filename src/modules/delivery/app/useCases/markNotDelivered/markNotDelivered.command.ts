import { IsUUID, IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class MarkNotDeliveredCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  observation!: string;
}
