import { Router } from 'express';
import { checkAuth } from '#src/interface/api/middleware/checkAuth.dependencies.js';
import { schemaValidation } from '#src/interface/api/middleware/schemaValidator.middleware.js';
import { Role } from '#src/shared/constant/roles.constant.js';
import {
  listPendingVerificationCtrl,
  verifyRouteCtrl,
  iniciarAlistamientoCtrl,
} from '#src/modules/cdi/infrastructure/dependencies.js';
import {
  listPendingVerificationSchema,
  verifyRouteSchema,
  startVerificationSchema,
} from '#src/modules/cdi/infrastructure/schema/cdi.schema.js';

const router = Router();

router.get(
  '/pending-verification',
  checkAuth.run([Role.ADMIN, Role.CEDI]),
  schemaValidation(listPendingVerificationSchema),
  listPendingVerificationCtrl.run,
);

router.post(
  '/routes/:id/verify',
  checkAuth.run([Role.ADMIN, Role.CEDI]),
  schemaValidation(verifyRouteSchema),
  verifyRouteCtrl.run,
);

router.post(
  '/routes/:id/start-verification',
  checkAuth.run([Role.ADMIN, Role.CEDI]),
  schemaValidation(startVerificationSchema),
  iniciarAlistamientoCtrl.run,
);

export default router;
