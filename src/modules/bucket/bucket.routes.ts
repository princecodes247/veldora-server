import express from 'express';
import BucketController from './bucket.controller';
import { isAuth } from '../auth';

const BucketRouter = express.Router();

BucketRouter.post('/', BucketController.create);
BucketRouter.post(
  '/regenerate-access-token',
  BucketController.regenerateAccessToken,
);
BucketRouter.get('/', isAuth(), BucketController.findAllUserBuckets);
BucketRouter.get('/g/:bucketId', BucketController.externalGetBucket);
BucketRouter.get('/g/rows', BucketController.externalGetSubmissions);
BucketRouter.get('/:bucketId', isAuth(), BucketController.findOne);
BucketRouter.patch('/:bucketId', BucketController.update);
BucketRouter.get('/:bucketId/view', BucketController.viewBucket);
BucketRouter.post('/:bucketId', BucketController.submit);
BucketRouter.post(
  '/:bucketId/update-whitelist',
  BucketController.updateWhiteList,
);
BucketRouter.delete('/:bucketId', BucketController.remove);

export default BucketRouter;
