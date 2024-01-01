import { Request } from 'express';
import { IUser } from '../user';

export interface RequestWithUser extends Request {
  user: IUser;
}

export interface RequestWithAuth extends Request {
  user: {
    _id: string;
    userID: string;
    email: string;
    phone: string;
    metadata: {
      username: string;
    };
  };
}
