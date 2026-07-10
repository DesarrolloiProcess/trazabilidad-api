import { Router } from 'express';
import { schemaValidation } from '#src/interface/api/middleware/schemaValidator.middleware.js';
import { trackDeliveryCtrl } from '#src/modules/clientPortal/infrastructure/dependencies.js';
import { trackDeliverySchema } from '#src/modules/clientPortal/infrastructure/schema/clientPortal.schema.js';

// Rutas públicas del portal de clientes: sin checkAuth, aisladas de las rutas internas.
const router = Router();

router.get('/deliveries/:trackingNumber', schemaValidation(trackDeliverySchema), trackDeliveryCtrl.run);

export default router;
