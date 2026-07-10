import { BaseCommand } from '#src/shared/commands/baseCommand.js';
import type { AuthenticatedUser } from '#src/shared/commands/authenticatedUser.js';

export abstract class AuthenticatedCommand extends BaseCommand {
  authUser!: AuthenticatedUser;
}
