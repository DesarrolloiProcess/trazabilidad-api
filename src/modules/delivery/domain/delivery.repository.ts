import type { ITransaction } from '#src/shared/helpers/transactions/domain/transaction.js';
import type { Delivery } from '#src/modules/delivery/domain/delivery.entity.js';

export interface IDeliveryQuery {
  page: number;
  limit: number;
  routeId?: string;
}

export interface IDeliveryRepository {
  getMany(query: IDeliveryQuery): Promise<{ data: Delivery[]; total: number }>;
  getById(id: string): Promise<Delivery | null>;
  getByTrackingNumber(trackingNumber: string): Promise<Delivery | null>;
  getConfirmedInWindow(from: Date, to: Date): Promise<Delivery[]>;
  create(entity: Delivery, config?: { tx?: ITransaction }): Promise<Delivery>;
  update(entity: Delivery, config?: { tx?: ITransaction }): Promise<Delivery>;
}
