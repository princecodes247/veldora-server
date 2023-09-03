import express from 'express';
import UserController from './user.controller';

const userRouter = express.Router();

userRouter.post('/', UserController.create);
userRouter.get('/', UserController.findAll);
userRouter.get('/me', UserController.findUserProfile);
userRouter.get('/:id', UserController.findOne);
userRouter.patch('/me', UserController.update);
userRouter.delete('/:id', UserController.remove);

export default userRouter;
