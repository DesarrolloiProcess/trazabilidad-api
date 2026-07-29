import { DrizzleRouteImpl } from '#src/modules/route/infrastructure/repositories/drizzleRoute.impl.js';
import { DrizzleDeliveryImpl } from '#src/modules/delivery/infrastructure/repositories/drizzleDelivery.impl.js';
import { DrizzleClientImpl } from '#src/modules/client/infrastructure/repositories/drizzleClient.impl.js';
import { DrizzlePatientImpl } from '#src/modules/patient/infrastructure/repositories/drizzlePatient.impl.js';
import { txtParserHandle } from '#src/shared/helpers/txtParser/infrastructure/dependencies.js';
import { uuidHandle } from '#src/shared/helpers/uuidHandle/infrastructure/dependencies.js';
import { transactionHandle } from '#src/shared/helpers/transactions/infrastructure/dependencies.js';

import { ImportTxtPlanillaUseCase } from '#src/modules/txtImport/app/useCases/importTxtPlanilla/importTxtPlanilla.useCase.js';
import { ImportTxtPlanillaCtrl } from '#src/modules/txtImport/infrastructure/interface/api/controller/importTxtPlanilla.ctrl.js';

const routeRepository = new DrizzleRouteImpl();
const deliveryRepository = new DrizzleDeliveryImpl();
const clientRepository = new DrizzleClientImpl();
const patientRepository = new DrizzlePatientImpl();

const importTxtPlanillaUseCase = new ImportTxtPlanillaUseCase(
  routeRepository,
  deliveryRepository,
  clientRepository,
  patientRepository,
  txtParserHandle,
  uuidHandle,
  transactionHandle,
);

export const importTxtPlanillaCtrl = new ImportTxtPlanillaCtrl(importTxtPlanillaUseCase);
