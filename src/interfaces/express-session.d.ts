import { Session } from 'express-session';
import mongoose from 'mongoose';
import { UserLevels } from '../modules/user';
declare module 'express-session' {
  interface Session {
    isAuthenticated: boolean;
    user: {
      _id: mongoose.Types.ObjectId | string;
      email: string;
      plan?: string;
      username: string;
      user_type: UserLevels;
    };
    // Add any other custom properties you need
  }
}
