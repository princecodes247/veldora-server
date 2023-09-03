import { Request, Response, NextFunction } from 'express';
import BucketService from '../bucket.service';

const bucketGuardMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = extractTokenFromHeader(req);
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    try {
      const payload = await BucketService.findByAccessToken(token);
      if (!payload) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      req['bucket'] = payload;
      next();
    } catch {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };
};

const extractTokenFromHeader = (request: Request): string | undefined => {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
};

export default bucketGuardMiddleware;
