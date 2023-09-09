import express from 'express';
import BucketController from './bucket.controller';
import { isAuth } from '../auth';
import {
  isUserBucketWithId,
  isUserBucketWithSlug,
} from './guards/user-bucket.guard';

const BucketRouter = express.Router();
export const OpenBucketRouter = express.Router();

BucketRouter.post('/', isAuth(), BucketController.create);
BucketRouter.post(
  '/regenerate-access-token',
  isAuth(),
  BucketController.regenerateAccessToken,
);
// BucketRouter.get('/', BucketController.findAll);
BucketRouter.get('/', isAuth(), BucketController.findAllUserBuckets);
// BucketRouter.get('/generate-slugs', BucketController.generateSlugs);

BucketRouter.get(
  '/:slug',
  isAuth(),
  isUserBucketWithSlug({ param: 'slug' }),
  BucketController.externalGetBucket,
);
BucketRouter.get(
  '/:bucketId',
  isAuth(),
  isUserBucketWithId({ param: 'bucketId' }),
  BucketController.findOne,
);

BucketRouter.patch('/:bucketId', isAuth(), BucketController.update);
BucketRouter.post(
  '/:bucketId/update-whitelist',
  isAuth(),
  BucketController.updateWhiteList,
);
BucketRouter.delete('/:bucketId', isAuth(), BucketController.remove);

// Data collection routes
BucketRouter.get('/:slug/view', BucketController.viewBucketBySlug);
BucketRouter.post('/:slug', BucketController.submitBySlug);
BucketRouter.get('/:bucketId/view', BucketController.viewBucket);
BucketRouter.post('/:bucketId', BucketController.submit);

// Open routes
OpenBucketRouter.get('/', BucketController.externalGetSubmissions);
OpenBucketRouter.get('/stats', BucketController.externalGetBucket);

export default BucketRouter;
