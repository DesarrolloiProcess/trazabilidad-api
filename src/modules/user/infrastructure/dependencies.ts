import { DrizzleUserImpl } from '#src/modules/user/infrastructure/repositories/drizzleUser.impl.js';
import { uuidHandle } from '#src/shared/helpers/uuidHandle/infrastructure/dependencies.js';
import { encryptHandle } from '#src/shared/helpers/encrypt/infrastructure/dependencies.js';
import { jwtHandle } from '#src/shared/helpers/jwt/infrastructure/dependencies.js';

import { CreateUserUseCase } from '#src/modules/user/app/useCases/createUser/createUser.useCase.js';
import { UpdateUserUseCase } from '#src/modules/user/app/useCases/updateUser/updateUser.useCase.js';
import { DeleteUserUseCase } from '#src/modules/user/app/useCases/deleteUser/deleteUser.useCase.js';
import { GetUserByIdUseCase } from '#src/modules/user/app/useCases/getUserById/getUserById.useCase.js';
import { ListUsersUseCase } from '#src/modules/user/app/useCases/listUsers/listUsers.useCase.js';
import { LoginUseCase } from '#src/modules/user/app/useCases/login/login.useCase.js';
import { ChangePasswordUseCase } from '#src/modules/user/app/useCases/changePassword/changePassword.useCase.js';
import { RequestOtpUseCase } from '#src/modules/user/app/useCases/requestOtp/requestOtp.useCase.js';
import { ResetPasswordWithOtpUseCase } from '#src/modules/user/app/useCases/resetPasswordWithOtp/resetPasswordWithOtp.useCase.js';

import { CreateUserCtrl } from '#src/modules/user/infrastructure/interface/api/controller/createUser.ctrl.js';
import { UpdateUserCtrl } from '#src/modules/user/infrastructure/interface/api/controller/updateUser.ctrl.js';
import { DeleteUserCtrl } from '#src/modules/user/infrastructure/interface/api/controller/deleteUser.ctrl.js';
import { GetUserByIdCtrl } from '#src/modules/user/infrastructure/interface/api/controller/getUserById.ctrl.js';
import { ListUsersCtrl } from '#src/modules/user/infrastructure/interface/api/controller/listUsers.ctrl.js';
import { LoginCtrl } from '#src/modules/user/infrastructure/interface/api/controller/login.ctrl.js';
import { ChangePasswordCtrl } from '#src/modules/user/infrastructure/interface/api/controller/changePassword.ctrl.js';
import { RequestOtpCtrl } from '#src/modules/user/infrastructure/interface/api/controller/requestOtp.ctrl.js';
import { ResetPasswordWithOtpCtrl } from '#src/modules/user/infrastructure/interface/api/controller/resetPasswordWithOtp.ctrl.js';

const userRepository = new DrizzleUserImpl();

const createUserUseCase = new CreateUserUseCase(userRepository, uuidHandle, encryptHandle);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
const listUsersUseCase = new ListUsersUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository, encryptHandle, jwtHandle);
const changePasswordUseCase = new ChangePasswordUseCase(userRepository, encryptHandle);
const requestOtpUseCase = new RequestOtpUseCase(userRepository, uuidHandle);
const resetPasswordWithOtpUseCase = new ResetPasswordWithOtpUseCase(userRepository, encryptHandle);

export const createUserCtrl = new CreateUserCtrl(createUserUseCase);
export const updateUserCtrl = new UpdateUserCtrl(updateUserUseCase);
export const deleteUserCtrl = new DeleteUserCtrl(deleteUserUseCase);
export const getUserByIdCtrl = new GetUserByIdCtrl(getUserByIdUseCase);
export const listUsersCtrl = new ListUsersCtrl(listUsersUseCase);
export const loginCtrl = new LoginCtrl(loginUseCase);
export const changePasswordCtrl = new ChangePasswordCtrl(changePasswordUseCase);
export const requestOtpCtrl = new RequestOtpCtrl(requestOtpUseCase);
export const resetPasswordWithOtpCtrl = new ResetPasswordWithOtpCtrl(resetPasswordWithOtpUseCase);
