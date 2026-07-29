import { Router } from 'express';
import healthRoutes from '#src/modules/health/infrastructure/interface/health.routes.js';
import userRoutes from '#src/modules/user/infrastructure/interface/api/routes/user.routes.js';
import distributionCenterRoutes from '#src/modules/distributionCenter/infrastructure/interface/api/routes/distributionCenter.routes.js';
import routeRoutes from '#src/modules/route/infrastructure/interface/api/routes/route.routes.js';
import deliveryRoutes from '#src/modules/delivery/infrastructure/interface/api/routes/delivery.routes.js';
import txtImportRoutes from '#src/modules/txtImport/infrastructure/interface/api/routes/txtImport.routes.js';
import cdiRoutes from '#src/modules/cdi/infrastructure/interface/api/routes/cdi.routes.js';
import patientRoutes from '#src/modules/patient/infrastructure/interface/api/routes/patient.routes.js';
import clientPortalRoutes from '#src/modules/clientPortal/infrastructure/interface/api/routes/clientPortal.routes.js';

const router = Router();

router.use('/health', healthRoutes);

router.use('/api/users', userRoutes);
router.use('/api/distribution-centers', distributionCenterRoutes);
router.use('/api/routes', routeRoutes);
router.use('/api/deliveries', deliveryRoutes);
router.use('/api/txt-import', txtImportRoutes);
router.use('/api/cdi', cdiRoutes);
router.use('/api/patients', patientRoutes);

// Rutas del portal de clientes: aisladas, sin JWT, sin datos internos de operación
router.use('/portal', clientPortalRoutes);

export default router;
