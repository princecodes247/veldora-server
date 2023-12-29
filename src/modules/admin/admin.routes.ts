import express from 'express';
import AdminController from './admin.controller';
import { isAuth } from '../auth/guards/auth.guard';
import { BucketController } from '../bucket';
import { UserController, UserLevels } from '../user';

const AdminRouter = express.Router();
AdminRouter.get('/stats', isAuth(UserLevels.ADMIN), AdminController.getStats);
AdminRouter.get('/buckets', isAuth(UserLevels.ADMIN), BucketController.findAll);
AdminRouter.get('/users', isAuth(UserLevels.ADMIN), UserController.findAll);

export default AdminRouter;
