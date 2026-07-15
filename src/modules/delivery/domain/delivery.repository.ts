import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';
import type { Delivery } from '#src/modules/delivery/domain/delivery.entity.js';

export interface IDeliveryQuery {
  page: number;
  limit: number;
  routeId?: string;
  /** Filtra por el CEDI dueño de la ruta de la entrega (join con routes) — usado para restringir al rol CEDI a su propia sede. */
  distributionCenterId?: string;
}

export interface IDeliveryRepository {
  getMany(query: IDeliveryQuery): Promise<{ data: Delivery[]; total: number }>;
  getById(id: string): Promise<Delivery | null>;
  getByTrackingNumber(trackingNumber: string): Promise<Delivery | null>;
  getManyByClientId(clientId: string): Promise<Delivery[]>;
  getConfirmedInWindow(from: Date, to: Date): Promise<Delivery[]>;
  create(entity: Delivery, config?: { tx?: ITransaction }): Promise<Delivery>;
  update(entity: Delivery, config?: { tx?: ITransaction }): Promise<Delivery>;
}
