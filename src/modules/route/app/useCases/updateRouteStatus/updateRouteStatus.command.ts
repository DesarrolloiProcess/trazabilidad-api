import { IsUUID, IsIn } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';
import type { RouteStatus } from '#src/modules/route/domain/route.entity.js';

const ROUTE_STATUS_VALUES: RouteStatus[] = ['creada', 'asignada', 'entregada_transportador', 'en_curso', 'completada', 'con_novedad'];

export class UpdateRouteStatusCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;

  @IsIn(ROUTE_STATUS_VALUES)
  status!: RouteStatus;
}
