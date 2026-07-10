import { Router } from 'express';
import { checkAuth } from '#src/interface/api/middleware/checkAuth.dependencies.js';
import { schemaValidation } from '#src/interface/api/middleware/schemaValidator.middleware.js';
import { Role } from '#src/shared/constant/roles.constant.js';
import {
  createUserCtrl,
  updateUserCtrl,
  deleteUserCtrl,
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
  deleteUserSchema,
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
router.post('/otp/request', schemaValidation(requestOtpSchema), requestOtpCtrl.run);
router.post('/otp/reset-password', schemaValidation(resetPasswordWithOtpSchema), resetPasswordWithOtpCtrl.run);

// Rutas autenticadas
router.post(
  '/change-password',
  checkAuth.run([Role.ADMIN, Role.CEDI, Role.CONDUCTOR]),
  schemaValidation(changePasswordSchema),
  changePasswordCtrl.run,
);

router.get('/', checkAuth.run([Role.ADMIN]), schemaValidation(listUsersSchema), listUsersCtrl.run);
router.get('/:id', checkAuth.run([Role.ADMIN]), schemaValidation(getUserByIdSchema), getUserByIdCtrl.run);
router.post('/', checkAuth.run([Role.ADMIN]), schemaValidation(createUserSchema), createUserCtrl.run);
router.put('/:id', checkAuth.run([Role.ADMIN]), schemaValidation(updateUserSchema), updateUserCtrl.run);
router.delete('/:id', checkAuth.run([Role.ADMIN]), schemaValidation(deleteUserSchema), deleteUserCtrl.run);

export default router;
