import { DrizzleDeliveryImpl } from '#src/modules/delivery/infrastructure/repositories/drizzleDelivery.impl.js';
import { TrackDeliveryUseCase } from '#src/modules/clientPortal/app/useCases/trackDelivery/trackDelivery.useCase.js';
import { TrackDeliveryCtrl } from '#src/modules/clientPortal/infrastructure/interface/api/controller/trackDelivery.ctrl.js';

const deliveryRepository = new DrizzleDeliveryImpl();

const trackDeliveryUseCase = new TrackDeliveryUseCase(deliveryRepository);

export const trackDeliveryCtrl = new TrackDeliveryCtrl(trackDeliveryUseCase);
