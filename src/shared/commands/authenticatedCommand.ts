import { IsDefined } from 'class-validator';
import { BaseCommand } from '#src/shared/commands/baseCommand.js';
import type { AuthenticatedUser } from '#src/shared/commands/authenticatedUser.js';

export abstract class AuthenticatedCommand extends BaseCommand {
  /**
   * `whitelist: true` en BaseCommand.create() descarta cualquier propiedad sin decorador de
   * class-validator — sin @IsDefined() aquí, authUser queda `undefined` en TODOS los comandos
   * autenticados (falla silenciosa, sin error de validación, solo un TypeError más adelante).
   */
  @IsDefined()
  authUser!: AuthenticatedUser;
}
