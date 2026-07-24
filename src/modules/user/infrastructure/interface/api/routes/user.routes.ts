import { Router } from 'express';
import { checkAuth } from '#src/interface/api/middleware/checkAuth.dependencies.js';
import { schemaValidation } from '#src/interface/api/middleware/schemaValidator.middleware.js';
import { Role } from '#src/shared/constant/roles.constant.js';
import {
  createUserCtrl,
  updateUserCtrl,
  getUserByIdCtrl,
  listUsersCtrl,
  loginCtrl,
  changePasswordCtrl,
  requestOtpCtrl,
  resetPasswordWithOtpCtrl,
} from '#src/modules/user/infrastructure/dependencies.js';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  listUsersSchema,
  loginSchema,
  changePasswordSchema,
  requestOtpSchema,
  resetPasswordWithOtpSchema,
} from '#src/modules/user/infrastructure/schema/user.schema.js';

const router = Router();

// Rutas públicas de autenticación
router.post('/login', schemaValidation(loginSchema), loginCtrl.run);
router.post('/request-otp', schemaValidation(requestOtpSchema), requestOtpCtrl.run);
router.post('/reset-password', schemaValidation(resetPasswordWithOtpSchema), resetPasswordWithOtpCtrl.run);

// Rutas autenticadas
router.post(
  '/change-password',
  checkAuth.run([Role.ADMIN, Role.CEDI, Role.CONDUCTOR]),
  schemaValidation(changePasswordSchema),
  changePasswordCtrl.run,
);

router.get('/', checkAuth.run([Role.ADMIN, Role.CEDI]), schemaValidation(listUsersSchema), listUsersCtrl.run);
router.get('/:id', checkAuth.run([Role.ADMIN]), schemaValidation(getUserByIdSchema), getUserByIdCtrl.run);
router.post('/', checkAuth.run([Role.ADMIN]), schemaValidation(createUserSchema), createUserCtrl.run);
router.patch('/:id', checkAuth.run([Role.ADMIN]), schemaValidation(updateUserSchema), updateUserCtrl.run);

export default router;
