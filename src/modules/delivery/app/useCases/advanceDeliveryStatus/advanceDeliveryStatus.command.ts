import { IsUUID, IsIn } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';
import type { DeliveryStatus } from '#src/modules/delivery/domain/delivery.entity.js';

const ADVANCEABLE_STATUS_VALUES: DeliveryStatus[] = ['alistado', 'entregado_transportador'];

export class AdvanceDeliveryStatusCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;

  @IsIn(ADVANCEABLE_STATUS_VALUES)
  status!: DeliveryStatus;
}
