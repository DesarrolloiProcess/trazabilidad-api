import { DrizzleDistributionCenterImpl } from '#src/modules/distributionCenter/infrastructure/repositories/drizzleDistributionCenter.impl.js';
import { uuidHandle } from '#src/shared/helpers/uuidHandle/infrastructure/dependencies.js';

import { CreateDistributionCenterUseCase } from '#src/modules/distributionCenter/app/useCases/createDistributionCenter/createDistributionCenter.useCase.js';
import { UpdateDistributionCenterUseCase } from '#src/modules/distributionCenter/app/useCases/updateDistributionCenter/updateDistributionCenter.useCase.js';
import { DeleteDistributionCenterUseCase } from '#src/modules/distributionCenter/app/useCases/deleteDistributionCenter/deleteDistributionCenter.useCase.js';
import { GetDistributionCenterByIdUseCase } from '#src/modules/distributionCenter/app/useCases/getDistributionCenterById/getDistributionCenterById.useCase.js';
import { ListDistributionCentersUseCase } from '#src/modules/distributionCenter/app/useCases/listDistributionCenters/listDistributionCenters.useCase.js';

import { CreateDistributionCenterCtrl } from '#src/modules/distributionCenter/infrastructure/interface/api/controller/createDistributionCenter.ctrl.js';
import { UpdateDistributionCenterCtrl } from '#src/modules/distributionCenter/infrastructure/interface/api/controller/updateDistributionCenter.ctrl.js';
import { DeleteDistributionCenterCtrl } from '#src/modules/distributionCenter/infrastructure/interface/api/controller/deleteDistributionCenter.ctrl.js';
import { GetDistributionCenterByIdCtrl } from '#src/modules/distributionCenter/infrastructure/interface/api/controller/getDistributionCenterById.ctrl.js';
import { ListDistributionCentersCtrl } from '#src/modules/distributionCenter/infrastructure/interface/api/controller/listDistributionCenters.ctrl.js';

const distributionCenterRepository = new DrizzleDistributionCenterImpl();

const createDistributionCenterUseCase = new CreateDistributionCenterUseCase(distributionCenterRepository, uuidHandle);
const updateDistributionCenterUseCase = new UpdateDistributionCenterUseCase(distributionCenterRepository);
const deleteDistributionCenterUseCase = new DeleteDistributionCenterUseCase(distributionCenterRepository);
const getDistributionCenterByIdUseCase = new GetDistributionCenterByIdUseCase(distributionCenterRepository);
const listDistributionCentersUseCase = new ListDistributionCentersUseCase(distributionCenterRepository);

export const createDistributionCenterCtrl = new CreateDistributionCenterCtrl(createDistributionCenterUseCase);
export const updateDistributionCenterCtrl = new UpdateDistributionCenterCtrl(updateDistributionCenterUseCase);
export const deleteDistributionCenterCtrl = new DeleteDistributionCenterCtrl(deleteDistributionCenterUseCase);
export const getDistributionCenterByIdCtrl = new GetDistributionCenterByIdCtrl(getDistributionCenterByIdUseCase);
export const listDistributionCentersCtrl = new ListDistributionCentersCtrl(listDistributionCentersUseCase);
