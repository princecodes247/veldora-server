import express from 'express';
import BucketController from './bucket.controller';
import { isAuth } from '../auth';
import {
  isUserBucketWithId,
  isUserBucketWithSlug,
} from './guards/user-bucket.guard';
import hasAccessToken from './guards/bucket-access-token.guard';
import checkBucketSchema from './guards/bucket-schema.guard';

const BucketRouter = express.Router();
export const OpenBucketRouter = express.Router();
export const SubmitBucketRouter = express.Router();

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
  '/old/:bucketId',
  isAuth(),
  isUserBucketWithId({ param: 'bucketId' }),
  BucketController.findOne,
);

BucketRouter.patch('/:bucketId', isAuth(), BucketController.update);
BucketRouter.patch(
  '/:bucketId/update-structure',
  isAuth(),
  BucketController.updateBucketStructure,
);

BucketRouter.post(
  '/:bucketId/update-whitelist',
  isAuth(),
  BucketController.updateWhiteList,
);
BucketRouter.delete('/:bucketId', isAuth(), BucketController.remove);

// Data collection routes
BucketRouter.get('/:bucketId/view', BucketController.viewBucket);
BucketRouter.post(
  '/:bucketId',
  //  isUserBucketWithId({ param: 'bucketId' }),
  BucketController.submit,
);

// Open routes
OpenBucketRouter.get(
  '/',
  hasAccessToken(),
  BucketController.externalGetSubmissions,
);
OpenBucketRouter.get(
  '/stats',
  hasAccessToken(),
  BucketController.externalGetBucket,
);

OpenBucketRouter.get('/:slug/view', BucketController.viewBucketBySlug);
OpenBucketRouter.get('/:slug', BucketController.warnForGETRequestOnSubmit);
OpenBucketRouter.post(
  '/:slug',
  isUserBucketWithSlug({ param: 'slug' }, false),
  checkBucketSchema(),
  BucketController.submitBySlug,
);

export default BucketRouter;
