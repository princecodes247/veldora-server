import { Request } from 'express';
import { IUser } from '../user';

export interface RequestWithUser extends Request {
  user: IUser;
}

export interface RequestWithAuth extends Request {
  user: {
    userID: string;
    email: string;
    phone: string;
    metadata: {
      username: string;
    };
  };
}
