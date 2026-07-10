import { IsString, IsNotEmpty } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class ImportTxtPlanillaCommand extends AuthenticatedCommand {
  @IsString()
  @IsNotEmpty()
  content!: string;
}
