import type { RouteDto } from '#src/modules/route/app/dto/route.dto.js';
import type { DeliveryDto } from '#src/modules/delivery/app/dto/delivery.dto.js';

export interface PendingVerificationDto {
  route: RouteDto;
  deliveries: DeliveryDto[];
}
