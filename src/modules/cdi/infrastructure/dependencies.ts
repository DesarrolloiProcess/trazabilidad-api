import { DrizzleRouteImpl } from '#src/modules/route/infrastructure/repositories/drizzleRoute.impl.js';
import { DrizzleDeliveryImpl } from '#src/modules/delivery/infrastructure/repositories/drizzleDelivery.impl.js';
import { transactionHandle } from '#src/shared/helpers/transactions/infrastructure/dependencies.js';

import { ListPendingVerificationUseCase } from '#src/modules/cdi/app/useCases/listPendingVerification/listPendingVerification.useCase.js';
import { VerifyRouteUseCase } from '#src/modules/cdi/app/useCases/verifyRoute/verifyRoute.useCase.js';

import { ListPendingVerificationCtrl } from '#src/modules/cdi/infrastructure/interface/api/controller/listPendingVerification.ctrl.js';
import { VerifyRouteCtrl } from '#src/modules/cdi/infrastructure/interface/api/controller/verifyRoute.ctrl.js';

const routeRepository = new DrizzleRouteImpl();
const deliveryRepository = new DrizzleDeliveryImpl();

const listPendingVerificationUseCase = new ListPendingVerificationUseCase(routeRepository, deliveryRepository);
const verifyRouteUseCase = new VerifyRouteUseCase(routeRepository, deliveryRepository, transactionHandle);

export const listPendingVerificationCtrl = new ListPendingVerificationCtrl(listPendingVerificationUseCase);
export const verifyRouteCtrl = new VerifyRouteCtrl(verifyRouteUseCase);
