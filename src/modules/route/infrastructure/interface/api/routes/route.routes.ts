import { Router } from 'express';
import { checkAuth } from '#src/interface/api/middleware/checkAuth.dependencies.js';
import { schemaValidation } from '#src/interface/api/middleware/schemaValidator.middleware.js';
import { Role } from '#src/shared/constant/roles.constant.js';
import {
  getRouteByIdCtrl,
  listRoutesCtrl,
  updateRouteStatusCtrl,
  assignDriverCtrl,
} from '#src/modules/route/infrastructure/dependencies.js';
import {
  getRouteByIdSchema,
  listRoutesSchema,
  updateRouteStatusSchema,
  assignDriverSchema,
} from '#src/modules/route/infrastructure/schema/route.schema.js';

const router = Router();

router.get('/', checkAuth.run([Role.ADMIN, Role.CEDI, Role.CONDUCTOR]), schemaValidation(listRoutesSchema), listRoutesCtrl.run);

router.get(
  '/:id',
  checkAuth.run([Role.ADMIN, Role.CEDI, Role.CONDUCTOR]),
  schemaValidation(getRouteByIdSchema),
  getRouteByIdCtrl.run,
);

// Cambio manual de estado de ruta: exclusivo ADMIN como excepción/override — el flujo normal avanza
// el estado solo mediante las acciones del propio proceso (verificar planilla, aceptar ruta, etc.).
router.patch(
  '/:id/status',
  checkAuth.run([Role.ADMIN]),
  schemaValidation(updateRouteStatusSchema),
  updateRouteStatusCtrl.run,
);

router.patch(
  '/:id/assign-driver',
  checkAuth.run([Role.ADMIN, Role.CEDI]),
  schemaValidation(assignDriverSchema),
  assignDriverCtrl.run,
);

export default router;
