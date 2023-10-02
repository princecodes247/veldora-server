import { Request, Response, NextFunction } from 'express';
import BucketService from '../bucket.service';
import { RequestWithAuth } from '../../auth';

export function canCreateBucket() {
  return async function (
    req: RequestWithAuth,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userBucketsCount = await BucketService.countUserBuckets(
        req.user.userID.toString(),
      );

      if (userBucketsCount >= 5) {
        throw new Error('You have reached your plan limit, Upgrade plan');
      }
      next();
    } catch (error) {
      console.log({ error });
      return res.status(401).json({ message: error.message });
    }
  };
}
