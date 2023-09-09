import { Request, Response, NextFunction } from 'express';
import BucketService from '../bucket.service';
import { RequestWithAuth } from '../../auth';

/* The `isUserBucket` function is a middleware function that is used to check if
the current user is the owner of a specific bucket. It is used to protect
routes that require the user to be the owner of the bucket in order to access
them. */

// Create a HOF that accepts the `id` parameter to check
export function isUserBucketWithId(target: { param?: string; query?: string }) {
  return async function (
    req: RequestWithAuth,
    res: Response,
    next: NextFunction,
  ) {
    try {
      let id = '';
      if (target.param) {
        id = req.params[target.param];
      } else if (target.query) {
        id = req.query[target.query].toString();
      } else {
        id = req.params['bucketId'];
      }
      const payload = await BucketService.findOne(id);

      console.log({ id, payload });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      if (!payload || payload.owner.toString() !== req.user.userID.toString()) {
        throw new Error('Unauthorized: You cannot access this bucket');
      }
      req['bucket'] = payload;
      next();
    } catch (error) {
      console.log({ error });
      return res.status(401).json({ message: 'Unauthorized: Error' });
    }
  };
}

export function isUserBucketWithSlug(target: {
  param?: string;
  query?: string;
}) {
  return async function (
    req: RequestWithAuth,
    res: Response,
    next: NextFunction,
  ) {
    try {
      let slug = '';
      if (target.param) {
        slug = req.params[target.param];
      } else if (target.query) {
        slug = req.query[target.query].toString();
      } else {
        slug = req.params['bucketId'];
      }
      const payload = await BucketService.findOneBySlug(slug);

      console.log({ slug, payload });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      if (!payload || payload.owner.toString() !== req.user.userID.toString()) {
        throw new Error('Unauthorized: You cannot access this bucket');
      }
      req['bucket'] = payload;
      next();
    } catch (error) {
      console.log({ error });
      return res.status(401).json({ message: 'Unauthorized: Error' });
    }
  };
}
