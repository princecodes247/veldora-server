import { Response, NextFunction } from 'express';
import { RequestWithBucket } from '../bucket.type';
import { BucketService } from '..';

/**
 * The function isHostWhiteListed is a middleware function that checks if a target object
 * is in a bucket whitelist and returns an error response if it is not.
 * @param target - The `target` parameter is an object that has two optional properties: `param` and
 * `query`. These properties are used to store strings that can be used for further processing within
 * the function.
 * @param {boolean} [checkUser=true] - A boolean flag indicating whether to check the user or not. If
 * set to true, the user will be checked; otherwise, the user will not be checked.
 * @returns an asynchronous function that takes in a request, response, and next function as
 * parameters.
 */

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
      return res.status(401).json({ message: 'Error' });
    }
  };
}
