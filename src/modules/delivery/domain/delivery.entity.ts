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
  clientId: string;
  trackingNumber: string;
  address: string;
  recipientName: string;
  recipientPhone: string;
  patientId: string | null;
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
  invoiced: boolean;
  invoicedAt: Date | null;
  alistamientoStartedAt: Date | null;
  alistamientoEndedAt: Date | null;
  verifierSignatureUrl: string | null;
  verifiedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export class Delivery {
  public readonly id: string;
  public readonly routeId: string;
  public readonly clientId: string;
  public readonly trackingNumber: string;
  public readonly address: string;
  public readonly recipientName: string;
  public readonly recipientPhone: string;
  public readonly patientId: string | null;
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
  public readonly invoiced: boolean;
  public readonly invoicedAt: Date | null;
  public readonly alistamientoStartedAt: Date | null;
  public readonly alistamientoEndedAt: Date | null;
  public readonly verifierSignatureUrl: string | null;
  public readonly verifiedBy: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly createdBy: string | null;
  public readonly updatedBy: string | null;

  constructor(props: IDelivery) {
    this.id = props.id;
    this.routeId = props.routeId;
    this.clientId = props.clientId;
    this.trackingNumber = props.trackingNumber;
    this.address = props.address;
    this.recipientName = props.recipientName;
    this.recipientPhone = props.recipientPhone;
    this.patientId = props.patientId;
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
    this.invoiced = props.invoiced;
    this.invoicedAt = props.invoicedAt;
    this.alistamientoStartedAt = props.alistamientoStartedAt;
    this.alistamientoEndedAt = props.alistamientoEndedAt;
    this.verifierSignatureUrl = props.verifierSignatureUrl;
    this.verifiedBy = props.verifiedBy;
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

  /** Marca el inicio del alistamiento (CDI abre la planilla) — no toca el estado ni se
   * reescribe en visitas repetidas, así el hito de inicio queda fijo la primera vez. */
  iniciarAlistamiento(updatedBy: string): Delivery {
    if (this.alistamientoStartedAt) return this;

    return new Delivery({ ...this, alistamientoStartedAt: new Date(), updatedAt: new Date(), updatedBy });
  }

  verificarAlistamiento(verifierSignatureUrl: string, updatedBy: string): Delivery {
    this.assertTransition('alistado');
    const now = new Date();

    return new Delivery({
      ...this,
      status: 'alistado',
      alistamientoEndedAt: now,
      verifierSignatureUrl,
      verifiedBy: updatedBy,
      updatedAt: now,
      updatedBy,
    });
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

  marcarFacturada(updatedBy: string): Delivery {
    if (this.status !== 'entregado_cliente') {
      throw new BusinessLogicError('Solo se puede exportar a facturación una entrega ya confirmada');
    }

    if (this.invoiced) {
      throw new BusinessLogicError('Esta entrega ya fue exportada a facturación');
    }

    const now = new Date();

    return new Delivery({ ...this, invoiced: true, invoicedAt: now, updatedAt: now, updatedBy });
  }
}
