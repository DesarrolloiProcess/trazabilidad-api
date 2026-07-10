import type { Delivery, DeliveryStatus, IDeliveryProduct } from '#src/modules/delivery/domain/delivery.entity.js';

export interface DeliveryDto {
  id: string;
  routeId: string;
  clientId: string;
  trackingNumber: string;
  address: string;
  recipientName: string;
  recipientPhone: string;
  products: IDeliveryProduct[];
  status: DeliveryStatus;
  signatureUrl: string | null;
  photoUrl: string | null;
  receiverName: string | null;
  receiverIdNumber: string | null;
  latitude: number | null;
  longitude: number | null;
  observation: string | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toDeliveryDto(entity: Delivery): DeliveryDto {
  return {
    id: entity.id,
    routeId: entity.routeId,
    clientId: entity.clientId,
    trackingNumber: entity.trackingNumber,
    address: entity.address,
    recipientName: entity.recipientName,
    recipientPhone: entity.recipientPhone,
    products: entity.products,
    status: entity.status,
    signatureUrl: entity.signatureUrl,
    photoUrl: entity.photoUrl,
    receiverName: entity.receiverName,
    receiverIdNumber: entity.receiverIdNumber,
    latitude: entity.latitude,
    longitude: entity.longitude,
    observation: entity.observation,
    deliveredAt: entity.deliveredAt,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
