// auth.routes.ts
import express from 'express';
import AuthController from './auth.controller';
import validateRequest from '../../middlwares/validateRequest';
import {
  registerUserSchema,
  requestEmailOTPSchema,
  verifyEmailOTPSchema,
} from './validations/register.validation';
import {
  changePasswordSchema,
  requestChangePasswordSchema,
  verifyChangePasswordRequestSchema,
} from './validations/forgot-password.validation';

const AuthRouter = express.Router();

// Define routes
AuthRouter.post('/login', AuthController.signIn);
AuthRouter.post(
  '/register',
  validateRequest(registerUserSchema),
  AuthController.signUp,
);
AuthRouter.post('/verify', AuthController.verifyAuth);

AuthRouter.post(
  '/otp/email',
  validateRequest(requestEmailOTPSchema),
  AuthController.sendEmailOTP,
);
AuthRouter.post('/otp/resend', AuthController.resendOTP);
AuthRouter.post(
  '/otp/email/verify',
  validateRequest(verifyEmailOTPSchema),
  AuthController.verifyEmailOTP,
);

AuthRouter.post(
  '/password/recover',
  validateRequest(requestChangePasswordSchema),
  AuthController.requestPasswordReset,
);

AuthRouter.post(
  '/password/verify',
  validateRequest(verifyChangePasswordRequestSchema),
  AuthController.verifyPasswordReset,
);

AuthRouter.post(
  '/password/reset',
  validateRequest(changePasswordSchema),
  AuthController.resetPassword,
);

export default AuthRouter;
