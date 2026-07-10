import { BusinessLogicError } from '#src/shared/Errors/businessLogicError.js';

export type DeliveryStatus = 'creado' | 'alistado' | 'entregado_transportador' | 'entregado_cliente' | 'no_entregado';

const ALLOWED_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  creado: ['alistado'],
  alistado: ['entregado_transportador'],
  entregado_transportador: ['entregado_cliente', 'no_entregado'],
  entregado_cliente: [],
  no_entregado: [],
};

export interface IDeliveryProduct {
  code: string;
  description: string;
  quantity: number;
  price: number;
}

export interface IConfirmDeliveryData {
  signatureUrl: string;
  photoUrl: string;
  receiverName: string;
  receiverIdNumber: string;
  latitude: number;
  longitude: number;
}

export interface IDelivery {
  id: string;
  routeId: string;
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
  createdBy: string | null;
  updatedBy: string | null;
}

export class Delivery {
  public readonly id: string;
  public readonly routeId: string;
  public readonly trackingNumber: string;
  public readonly address: string;
  public readonly recipientName: string;
  public readonly recipientPhone: string;
  public readonly products: IDeliveryProduct[];
  public readonly status: DeliveryStatus;
  public readonly signatureUrl: string | null;
  public readonly photoUrl: string | null;
  public readonly receiverName: string | null;
  public readonly receiverIdNumber: string | null;
  public readonly latitude: number | null;
  public readonly longitude: number | null;
  public readonly observation: string | null;
  public readonly deliveredAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly createdBy: string | null;
  public readonly updatedBy: string | null;

  constructor(props: IDelivery) {
    this.id = props.id;
    this.routeId = props.routeId;
    this.trackingNumber = props.trackingNumber;
    this.address = props.address;
    this.recipientName = props.recipientName;
    this.recipientPhone = props.recipientPhone;
    this.products = props.products;
    this.status = props.status;
    this.signatureUrl = props.signatureUrl;
    this.photoUrl = props.photoUrl;
    this.receiverName = props.receiverName;
    this.receiverIdNumber = props.receiverIdNumber;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.observation = props.observation;
    this.deliveredAt = props.deliveredAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.createdBy = props.createdBy;
    this.updatedBy = props.updatedBy;
  }

  private assertTransition(newStatus: DeliveryStatus): void {
    const allowed = ALLOWED_TRANSITIONS[this.status];

    if (!allowed.includes(newStatus)) {
      throw new BusinessLogicError(`No se puede cambiar la entrega de '${this.status}' a '${newStatus}'`);
    }
  }

  avanzarEstado(nuevoEstado: DeliveryStatus, updatedBy: string): Delivery {
    this.assertTransition(nuevoEstado);

    return new Delivery({ ...this, status: nuevoEstado, updatedAt: new Date(), updatedBy });
  }

  confirmarEntrega(data: IConfirmDeliveryData, updatedBy: string): Delivery {
    this.assertTransition('entregado_cliente');

    return new Delivery({
      ...this,
      status: 'entregado_cliente',
      signatureUrl: data.signatureUrl,
      photoUrl: data.photoUrl,
      receiverName: data.receiverName,
      receiverIdNumber: data.receiverIdNumber,
      latitude: data.latitude,
      longitude: data.longitude,
      deliveredAt: new Date(),
      updatedAt: new Date(),
      updatedBy,
    });
  }

  marcarNoEntregado(observacion: string, updatedBy: string): Delivery {
    this.assertTransition('no_entregado');

    return new Delivery({
      ...this,
      status: 'no_entregado',
      observation: observacion,
      deliveredAt: new Date(),
      updatedAt: new Date(),
      updatedBy,
    });
  }
}
