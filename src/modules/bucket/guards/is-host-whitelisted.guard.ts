import { Response, NextFunction } from 'express';
import { RequestWithBucket } from '../bucket.type';
import { BucketService } from '..';

export function isHostWhiteListed(
  target: {
    param?: string;
    query?: string;
  },
  checkUser: boolean = true,
) {
  return async function (
    req: RequestWithBucket,
    res: Response,
    next: NextFunction,
  ) {
    try {
      BucketService.isInBucketWhiteList(req.bucket, '');
      next();
    } catch (error) {
      console.log({ error });
      return res.status(401).json({ message: 'Unauthorized: Error' });
    }
  };
}
