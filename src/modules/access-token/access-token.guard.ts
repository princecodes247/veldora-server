import { Request, Response, NextFunction } from 'express';
import { AccessLevels } from './access-token.type';
import AccessTokenService from './access-token.service';

const accessTokenGuard = (requiredLevel: AccessLevels) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = extractTokenFromHeader(req);
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    try {
      const payload = await AccessTokenService.getValidAccessToken({
        token,
        level: requiredLevel,
      });
      if (!payload) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      req['resource'] = payload.resource;
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

export default accessTokenGuard;
