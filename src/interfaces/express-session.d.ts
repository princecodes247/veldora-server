import { Session } from 'express-session';
declare module 'express-session' {
  interface Session {
    isAuthenticated: boolean;
    user: {
      userID: string;
      email: string;
      phone: string;
      metadata: {
        username: string;
      };
    };
    // Add any other custom properties you need
  }
}
