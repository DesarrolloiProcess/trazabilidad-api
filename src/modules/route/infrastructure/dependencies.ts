import { DrizzleRouteImpl } from '#src/modules/route/infrastructure/repositories/drizzleRoute.impl.js';
import { DrizzleUserImpl } from '#src/modules/user/infrastructure/repositories/drizzleUser.impl.js';
import { DrizzleDeliveryImpl } from '#src/modules/delivery/infrastructure/repositories/drizzleDelivery.impl.js';

import { GetRouteByIdUseCase } from '#src/modules/route/app/useCases/getRouteById/getRouteById.useCase.js';
import { ListRoutesUseCase } from '#src/modules/route/app/useCases/listRoutes/listRoutes.useCase.js';
import { UpdateRouteStatusUseCase } from '#src/modules/route/app/useCases/updateRouteStatus/updateRouteStatus.useCase.js';
import { AssignDriverUseCase } from '#src/modules/route/app/useCases/assignDriver/assignDriver.useCase.js';

import { GetRouteByIdCtrl } from '#src/modules/route/infrastructure/interface/api/controller/getRouteById.ctrl.js';
import { ListRoutesCtrl } from '#src/modules/route/infrastructure/interface/api/controller/listRoutes.ctrl.js';
import { UpdateRouteStatusCtrl } from '#src/modules/route/infrastructure/interface/api/controller/updateRouteStatus.ctrl.js';
import { AssignDriverCtrl } from '#src/modules/route/infrastructure/interface/api/controller/assignDriver.ctrl.js';

export const routeRepository = new DrizzleRouteImpl();
const userRepository = new DrizzleUserImpl();
const deliveryRepository = new DrizzleDeliveryImpl();

const getRouteByIdUseCase = new GetRouteByIdUseCase(routeRepository);
const listRoutesUseCase = new ListRoutesUseCase(routeRepository);
const updateRouteStatusUseCase = new UpdateRouteStatusUseCase(routeRepository);
const assignDriverUseCase = new AssignDriverUseCase(routeRepository, userRepository, deliveryRepository);

export const getRouteByIdCtrl = new GetRouteByIdCtrl(getRouteByIdUseCase);
export const listRoutesCtrl = new ListRoutesCtrl(listRoutesUseCase);
export const updateRouteStatusCtrl = new UpdateRouteStatusCtrl(updateRouteStatusUseCase);
export const assignDriverCtrl = new AssignDriverCtrl(assignDriverUseCase);
