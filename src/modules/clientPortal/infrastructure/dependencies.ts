import { DrizzleDeliveryImpl } from '#src/modules/delivery/infrastructure/repositories/drizzleDelivery.impl.js';
import { DrizzleClientImpl } from '#src/modules/client/infrastructure/repositories/drizzleClient.impl.js';
import { TrackDeliveryUseCase } from '#src/modules/clientPortal/app/useCases/trackDelivery/trackDelivery.useCase.js';
import { ListMyDeliveriesUseCase } from '#src/modules/clientPortal/app/useCases/listMyDeliveries/listMyDeliveries.useCase.js';
import { TrackDeliveryCtrl } from '#src/modules/clientPortal/infrastructure/interface/api/controller/trackDelivery.ctrl.js';
import { ListMyDeliveriesCtrl } from '#src/modules/clientPortal/infrastructure/interface/api/controller/listMyDeliveries.ctrl.js';

const deliveryRepository = new DrizzleDeliveryImpl();
const clientRepository = new DrizzleClientImpl();

const trackDeliveryUseCase = new TrackDeliveryUseCase(deliveryRepository, clientRepository);
const listMyDeliveriesUseCase = new ListMyDeliveriesUseCase(deliveryRepository, clientRepository);

export const trackDeliveryCtrl = new TrackDeliveryCtrl(trackDeliveryUseCase);
export const listMyDeliveriesCtrl = new ListMyDeliveriesCtrl(listMyDeliveriesUseCase);
