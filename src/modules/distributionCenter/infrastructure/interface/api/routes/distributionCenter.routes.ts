import { Router } from 'express';
import { checkAuth } from '#src/interface/api/middleware/checkAuth.dependencies.js';
import { schemaValidation } from '#src/interface/api/middleware/schemaValidator.middleware.js';
import { Role } from '#src/shared/constant/roles.constant.js';
import {
  createDistributionCenterCtrl,
  updateDistributionCenterCtrl,
  getDistributionCenterByIdCtrl,
  listDistributionCentersCtrl,
} from '#src/modules/distributionCenter/infrastructure/dependencies.js';
import {
  createDistributionCenterSchema,
  updateDistributionCenterSchema,
  getDistributionCenterByIdSchema,
  listDistributionCentersSchema,
} from '#src/modules/distributionCenter/infrastructure/schema/distributionCenter.schema.js';

const router = Router();

router.get(
  '/',
  checkAuth.run([Role.ADMIN, Role.CEDI]),
  schemaValidation(listDistributionCentersSchema),
  listDistributionCentersCtrl.run,
);

router.get(
  '/:id',
  checkAuth.run([Role.ADMIN, Role.CEDI]),
  schemaValidation(getDistributionCenterByIdSchema),
  getDistributionCenterByIdCtrl.run,
);

router.post('/', checkAuth.run([Role.ADMIN]), schemaValidation(createDistributionCenterSchema), createDistributionCenterCtrl.run);

router.patch(
  '/:id',
  checkAuth.run([Role.ADMIN]),
  schemaValidation(updateDistributionCenterSchema),
  updateDistributionCenterCtrl.run,
);

export default router;
