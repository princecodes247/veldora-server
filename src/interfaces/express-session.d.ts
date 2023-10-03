import { Session } from 'express-session';
import mongoose from 'mongoose';
declare module 'express-session' {
  interface Session {
    isAuthenticated: boolean;
    user: {
      _id: mongoose.Types.ObjectId | string;
      email: string;
      plan?: '';
      username: string;
    };
    // Add any other custom properties you need
  }
}
