import express from 'express';
import UserController from './user.controller';
import UserModel from './models/user.model';
import generateSlug from '../../utils/generate-slug.util';
import { users_former } from '../../constants';
import { BucketModel } from '../bucket';
import { isAuth } from '../auth/guards/auth.guard';

const userRouter = express.Router();
userRouter.post('/', isAuth(), UserController.create);
userRouter.get('/', isAuth(), UserController.findAll);
userRouter.get('/me', isAuth(), UserController.findUserProfile);
userRouter.get('/:id', isAuth(), UserController.findOne);
userRouter.patch('/me', isAuth(), UserController.update);
userRouter.delete('/:id', isAuth(), UserController.remove);

export default userRouter;
