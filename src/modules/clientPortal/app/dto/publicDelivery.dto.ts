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
  signatureUrl: string | null;
  photoUrl: string | null;
  receiverName: string | null;
  receiverIdNumber: string | null;
  latitude: number | null;
  longitude: number | null;
}

export function toPublicDeliveryDto(entity: Delivery): PublicDeliveryDto {
  const isDelivered = entity.status === 'entregado_cliente';

  return {
    trackingNumber: entity.trackingNumber,
    status: entity.status,
    address: entity.address,
    recipientName: entity.recipientName,
    products: entity.products.map(({ code, description, quantity }) => ({ code, description, quantity })),
    deliveredAt: entity.deliveredAt,
    signatureUrl: isDelivered ? entity.signatureUrl : null,
    photoUrl: isDelivered ? entity.photoUrl : null,
    receiverName: isDelivered ? entity.receiverName : null,
    receiverIdNumber: isDelivered ? entity.receiverIdNumber : null,
    latitude: isDelivered ? entity.latitude : null,
    longitude: isDelivered ? entity.longitude : null,
  };
}
