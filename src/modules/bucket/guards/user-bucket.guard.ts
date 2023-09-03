import { Request, Response, NextFunction } from 'express';
import BucketService from '../bucket.service';
import { RequestWithAuth } from 'src/modules/auth';

export async function userBucketGuardMiddleware(
  req: RequestWithAuth,
  res: Response,
  next: NextFunction,
) {
  try {
    const payload = await BucketService.findOne(req.params.id);

    // 💡 We're assigning the payload to the request object here
    // so that we can access it in our route handlers
    if (!payload || payload.owner.toString() !== req.user.userID.toString()) {
      throw new Error('Unauthorized');
    }
    req['bucket'] = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
