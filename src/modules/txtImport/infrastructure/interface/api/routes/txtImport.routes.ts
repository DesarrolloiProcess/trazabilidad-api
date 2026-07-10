import { Router } from 'express';
import { checkAuth } from '#src/interface/api/middleware/checkAuth.dependencies.js';
import { schemaValidation } from '#src/interface/api/middleware/schemaValidator.middleware.js';
import { Role } from '#src/shared/constant/roles.constant.js';
import { importTxtPlanillaCtrl } from '#src/modules/txtImport/infrastructure/dependencies.js';
import { importTxtPlanillaSchema } from '#src/modules/txtImport/infrastructure/schema/txtImport.schema.js';

const router = Router();

router.post('/', checkAuth.run([Role.ADMIN, Role.CEDI]), schemaValidation(importTxtPlanillaSchema), importTxtPlanillaCtrl.run);

export default router;
