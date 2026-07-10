import type { Delivery, IDeliveryProduct } from '#src/modules/delivery/domain/delivery.entity.js';

export interface InvoiceExportProductDto {
  code: string;
  description: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface InvoiceExportDto {
  trackingNumber: string;
  routeId: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  products: InvoiceExportProductDto[];
  total: number;
  evidence: {
    signatureUrl: string | null;
    photoUrl: string | null;
    receiverName: string | null;
    receiverIdNumber: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  deliveredAt: Date | null;
}

function toInvoiceExportProduct(product: IDeliveryProduct): InvoiceExportProductDto {
  return { ...product, subtotal: product.quantity * product.price };
}

export function toInvoiceExportDto(entity: Delivery): InvoiceExportDto {
  const products = entity.products.map(toInvoiceExportProduct);

  return {
    trackingNumber: entity.trackingNumber,
    routeId: entity.routeId,
    recipientName: entity.recipientName,
    recipientPhone: entity.recipientPhone,
    address: entity.address,
    products,
    total: products.reduce((sum, product) => sum + product.subtotal, 0),
    evidence: {
      signatureUrl: entity.signatureUrl,
      photoUrl: entity.photoUrl,
      receiverName: entity.receiverName,
      receiverIdNumber: entity.receiverIdNumber,
      latitude: entity.latitude,
      longitude: entity.longitude,
    },
    deliveredAt: entity.deliveredAt,
  };
}
