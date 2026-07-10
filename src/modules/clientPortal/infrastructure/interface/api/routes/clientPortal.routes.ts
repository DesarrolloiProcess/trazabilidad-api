import { Router } from 'express';
import { schemaValidation } from '#src/interface/api/middleware/schemaValidator.middleware.js';
import { trackDeliveryCtrl, listMyDeliveriesCtrl } from '#src/modules/clientPortal/infrastructure/dependencies.js';
import { trackDeliverySchema, listMyDeliveriesSchema } from '#src/modules/clientPortal/infrastructure/schema/clientPortal.schema.js';

// Rutas públicas del portal de clientes: sin checkAuth, aisladas de las rutas internas.
const router = Router();

router.get('/deliveries/:trackingNumber', schemaValidation(trackDeliverySchema), trackDeliveryCtrl.run);

// "Login": verifica guía + NIT/teléfono y devuelve el historial completo del cliente asociado.
router.get('/my-deliveries/:trackingNumber', schemaValidation(listMyDeliveriesSchema), listMyDeliveriesCtrl.run);

export default router;
