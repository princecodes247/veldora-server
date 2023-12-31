import { Request, Response, NextFunction } from 'express';
import { UserLevels } from '../../user/user.type';

export const isAuth = (requiredLevel: UserLevels = UserLevels.USER) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let userID: string;

      if (req.session.isAuthenticated) {
        userID = req.session.user._id.toString();
      } else {
        const token = extractTokenFromHeader(req);
        if (!token) {
          res.status(401).json({ message: 'Unauthorized' });
          return;
        }

        // userID = await passageAuth.authenticate(token);
        // console.log({ userID });
        // if (!userID) {
        // }
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      if (
        requiredLevel === UserLevels.ADMIN &&
        req.session.user.user_type !== UserLevels.ADMIN
      ) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      // User is authenticated
      // Assign user data to the request object
      req['user'] = { ...req.session.user, userID: req.session.user._id };

      next(); // Continue to the next middleware or route handler
    } catch {
      res.status(401).json({ message: 'Unauthorizedend' });
      return;
    }
  };
};

export const extractTokenFromHeader = (
  request: Request,
): string | undefined => {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
};
