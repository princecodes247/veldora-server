import { Request, Response, NextFunction } from 'express';
import PassageAuth from '../../../utils/passage-auth.util';

const isAuth = () => {
  const passageAuth = new PassageAuth();
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let userID: string;
      if (req.session.isAuthenticated) {
        userID = req.session.user.userID;
      } else {
        const token = extractTokenFromHeader(req);
        if (!token) {
          res.status(401).json({ message: 'Unauthorized' });
          return;
        }

        userID = await passageAuth.authenticate(token);
        console.log({ userID });
        if (!userID) {
          res.status(401).json({ message: 'Unauthorized' });
          return;
        }
      }
      // User is authenticated
      const user = await passageAuth.getUser(userID);
      const { email, phone } = user;
      const identifier = email ? email : phone;

      // Assign user data to the request object
      req['user'] = {
        userID,
        email,
        phone,
        metadata: {
          username: user.user_metadata.username.toString(),
        },
      };
      req.session.user = {
        userID,
        email,
        phone,
        metadata: {
          username: user.user_metadata.username.toString(),
        },
      };
      req.session.isAuthenticated = true;

      next(); // Continue to the next middleware or route handler
    } catch {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
  };
};

const extractTokenFromHeader = (request: Request): string | undefined => {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
};

export default isAuth;
