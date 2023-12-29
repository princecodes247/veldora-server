import express from 'express';
import AdminController from './admin.controller';
import { isAuth } from '../auth/guards/auth.guard';

const userRouter = express.Router();
userRouter.get('/stats', isAuth(), AdminController.getStats);

export default userRouter;
