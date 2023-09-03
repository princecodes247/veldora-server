// auth.routes.ts
import express from 'express';
import AuthController from './auth.controller';

const AuthRouter = express.Router();

// Define routes
AuthRouter.post('/login', AuthController.signIn);
AuthRouter.post('/register', AuthController.signUp);
AuthRouter.post('/verify', AuthController.verifyAuth);

export default AuthRouter;
