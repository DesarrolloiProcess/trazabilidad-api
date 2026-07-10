import { Router } from 'express';
import { checkAuth } from '#src/interface/api/middleware/checkAuth.dependencies.js';
import { schemaValidation } from '#src/interface/api/middleware/schemaValidator.middleware.js';
import { Role } from '#src/shared/constant/roles.constant.js';
import {
  getDeliveryByIdCtrl,
  listDeliveriesCtrl,
  advanceDeliveryStatusCtrl,
  deliveryEvidenceCtrl,
  markNotDeliveredCtrl,
  invoiceExportCtrl,
} from '#src/modules/delivery/infrastructure/dependencies.js';
import {
  getDeliveryByIdSchema,
  listDeliveriesSchema,
  advanceDeliveryStatusSchema,
  deliveryEvidenceSchema,
  markNotDeliveredSchema,
  invoiceExportSchema,
} from '#src/modules/delivery/infrastructure/schema/delivery.schema.js';

const router = Router();

router.get('/', checkAuth.run([Role.ADMIN, Role.CEDI, Role.CONDUCTOR]), schemaValidation(listDeliveriesSchema), listDeliveriesCtrl.run);

router.get(
  '/invoice-export',
  checkAuth.run([Role.ADMIN, Role.CEDI]),
  schemaValidation(invoiceExportSchema),
  invoiceExportCtrl.run,
);

router.get(
  '/:id',
  checkAuth.run([Role.ADMIN, Role.CEDI, Role.CONDUCTOR]),
  schemaValidation(getDeliveryByIdSchema),
  getDeliveryByIdCtrl.run,
);

router.patch(
  '/:id/status',
  checkAuth.run([Role.CONDUCTOR, Role.CEDI, Role.ADMIN]),
  schemaValidation(advanceDeliveryStatusSchema),
  advanceDeliveryStatusCtrl.run,
);

router.post(
  '/:id/evidence',
  checkAuth.run([Role.CONDUCTOR]),
  schemaValidation(deliveryEvidenceSchema),
  deliveryEvidenceCtrl.run,
);

router.post(
  '/:id/not-delivered',
  checkAuth.run([Role.CONDUCTOR]),
  schemaValidation(markNotDeliveredSchema),
  markNotDeliveredCtrl.run,
);

export default router;
