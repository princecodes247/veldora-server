// auth.routes.ts
import express from 'express';
import AuthController from './auth.controller';
import ForgotPasswordController from './forgot-password.controller';
import validateRequest from '../../middlwares/validateRequest';
import {
  loginUserSchema,
  registerUserSchema,
  requestEmailVerificationSchema,
} from './validations/register.validation';
import {
  changePasswordSchema,
  requestChangePasswordSchema,
  verifyChangePasswordRequestSchema,
} from './validations/forgot-password.validation';

const AuthRouter = express.Router();

// Define routes
AuthRouter.post(
  '/login',
  validateRequest(loginUserSchema),
  AuthController.signIn,
);
AuthRouter.post(
  '/register',
  validateRequest(registerUserSchema),
  AuthController.signUp,
);
AuthRouter.post('/logout', AuthController.logout);
AuthRouter.post('/verify', AuthController.verifyAuth);

AuthRouter.post(
  '/email-verification',
  validateRequest(requestEmailVerificationSchema),
  AuthController.sendEmailVerification,
);
AuthRouter.post(
  '/email-verification/verify',
  validateRequest(requestEmailVerificationSchema),
  AuthController.verifyEmailOTP,
);

AuthRouter.post(
  '/forgot-password',
  validateRequest(requestChangePasswordSchema),
  ForgotPasswordController.resendPasswordReset,
);

AuthRouter.post(
  '/forgot-password/verify',
  validateRequest(verifyChangePasswordRequestSchema),
  ForgotPasswordController.verifyPasswordReset,
);

AuthRouter.post(
  '/forgot-password/reset',
  validateRequest(changePasswordSchema),
  ForgotPasswordController.resetPassword,
);

export default AuthRouter;
