import type { Delivery, DeliveryStatus } from '#src/modules/delivery/domain/delivery.entity.js';

export interface PublicDeliveryProductDto {
  code: string;
  description: string;
  quantity: number;
}

export interface PublicDeliveryDto {
  trackingNumber: string;
  status: DeliveryStatus;
  address: string;
  recipientName: string;
  products: PublicDeliveryProductDto[];
  deliveredAt: Date | null;
}

export function toPublicDeliveryDto(entity: Delivery): PublicDeliveryDto {
  return {
    trackingNumber: entity.trackingNumber,
    status: entity.status,
    address: entity.address,
    recipientName: entity.recipientName,
    products: entity.products.map(({ code, description, quantity }) => ({ code, description, quantity })),
    deliveredAt: entity.deliveredAt,
  };
}
