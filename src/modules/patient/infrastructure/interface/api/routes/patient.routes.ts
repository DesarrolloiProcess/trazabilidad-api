import { Router } from 'express';
import { checkAuth } from '#src/interface/api/middleware/checkAuth.dependencies.js';
import { schemaValidation } from '#src/interface/api/middleware/schemaValidator.middleware.js';
import { Role } from '#src/shared/constant/roles.constant.js';
import {
  createPatientCtrl,
  updatePatientCtrl,
  getPatientByIdCtrl,
  listPatientsCtrl,
} from '#src/modules/patient/infrastructure/dependencies.js';
import {
  createPatientSchema,
  updatePatientSchema,
  getPatientByIdSchema,
  listPatientsSchema,
} from '#src/modules/patient/infrastructure/schema/patient.schema.js';

const router = Router();

router.get('/', checkAuth.run([Role.ADMIN]), schemaValidation(listPatientsSchema), listPatientsCtrl.run);
router.get('/:id', checkAuth.run([Role.ADMIN]), schemaValidation(getPatientByIdSchema), getPatientByIdCtrl.run);
router.post('/', checkAuth.run([Role.ADMIN]), schemaValidation(createPatientSchema), createPatientCtrl.run);
router.patch('/:id', checkAuth.run([Role.ADMIN]), schemaValidation(updatePatientSchema), updatePatientCtrl.run);

export default router;
