import type { PublicDeliveryDto } from '#src/modules/clientPortal/app/dto/publicDelivery.dto.js';

export interface ClientSummaryDto {
  nit: string;
  name: string;
}

export interface MyDeliveriesDto {
  client: ClientSummaryDto;
  deliveries: PublicDeliveryDto[];
}
