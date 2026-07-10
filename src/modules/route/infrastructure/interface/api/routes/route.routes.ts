import { Router } from 'express';
import { checkAuth } from '#src/interface/api/middleware/checkAuth.dependencies.js';
import { schemaValidation } from '#src/interface/api/middleware/schemaValidator.middleware.js';
import { Role } from '#src/shared/constant/roles.constant.js';
import {
  getRouteByIdCtrl,
  listRoutesCtrl,
  updateRouteStatusCtrl,
} from '#src/modules/route/infrastructure/dependencies.js';
import {
  getRouteByIdSchema,
  listRoutesSchema,
  updateRouteStatusSchema,
} from '#src/modules/route/infrastructure/schema/route.schema.js';

const router = Router();

router.get('/', checkAuth.run([Role.ADMIN, Role.CEDI, Role.CONDUCTOR]), schemaValidation(listRoutesSchema), listRoutesCtrl.run);

router.get(
  '/:id',
  checkAuth.run([Role.ADMIN, Role.CEDI, Role.CONDUCTOR]),
  schemaValidation(getRouteByIdSchema),
  getRouteByIdCtrl.run,
);

router.patch(
  '/:id/status',
  checkAuth.run([Role.ADMIN, Role.CEDI, Role.CONDUCTOR]),
  schemaValidation(updateRouteStatusSchema),
  updateRouteStatusCtrl.run,
);

export default router;
