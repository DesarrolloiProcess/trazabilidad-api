import { DrizzlePatientImpl } from '#src/modules/patient/infrastructure/repositories/drizzlePatient.impl.js';
import { DrizzleDeliveryImpl } from '#src/modules/delivery/infrastructure/repositories/drizzleDelivery.impl.js';
import { uuidHandle } from '#src/shared/helpers/uuidHandle/infrastructure/dependencies.js';

import { CreatePatientUseCase } from '#src/modules/patient/app/useCases/createPatient/createPatient.useCase.js';
import { UpdatePatientUseCase } from '#src/modules/patient/app/useCases/updatePatient/updatePatient.useCase.js';
import { ListPatientsUseCase } from '#src/modules/patient/app/useCases/listPatients/listPatients.useCase.js';
import { GetPatientByIdUseCase } from '#src/modules/patient/app/useCases/getPatientById/getPatientById.useCase.js';

import { CreatePatientCtrl } from '#src/modules/patient/infrastructure/interface/api/controller/createPatient.ctrl.js';
import { UpdatePatientCtrl } from '#src/modules/patient/infrastructure/interface/api/controller/updatePatient.ctrl.js';
import { ListPatientsCtrl } from '#src/modules/patient/infrastructure/interface/api/controller/listPatients.ctrl.js';
import { GetPatientByIdCtrl } from '#src/modules/patient/infrastructure/interface/api/controller/getPatientById.ctrl.js';

export const patientRepository = new DrizzlePatientImpl();
const deliveryRepository = new DrizzleDeliveryImpl();

const createPatientUseCase = new CreatePatientUseCase(patientRepository, uuidHandle);
const updatePatientUseCase = new UpdatePatientUseCase(patientRepository, deliveryRepository);
const listPatientsUseCase = new ListPatientsUseCase(patientRepository);
const getPatientByIdUseCase = new GetPatientByIdUseCase(patientRepository);

export const createPatientCtrl = new CreatePatientCtrl(createPatientUseCase);
export const updatePatientCtrl = new UpdatePatientCtrl(updatePatientUseCase);
export const listPatientsCtrl = new ListPatientsCtrl(listPatientsUseCase);
export const getPatientByIdCtrl = new GetPatientByIdCtrl(getPatientByIdUseCase);
