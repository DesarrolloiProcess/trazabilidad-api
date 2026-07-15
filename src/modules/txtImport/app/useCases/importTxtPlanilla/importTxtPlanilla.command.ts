import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class ImportTxtPlanillaCommand extends AuthenticatedCommand {
  @IsString()
  @IsNotEmpty()
  content!: string;

  /** Solo relevante para ADMIN, que no pertenece a un CEDI propio. CEDI siempre usa el suyo, sin importar este valor. */
  @IsOptional()
  @IsUUID()
  distributionCenterId?: string;
}
