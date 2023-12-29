import express, { Router } from 'express';

import SubmissionController from './submission.controller';
import {
  isUserBucketWithId,
  isUserBucketWithSlug,
} from '../bucket/guards/user-bucket.guard';
import { isAuth } from '../auth/guards/auth.guard';
import hasAccessToken from '../bucket/guards/bucket-access-token.guard';

const SubmissionRouter: Router = express.Router();
export const OpenSubmissionRouter = express.Router();

SubmissionRouter.get(
  '/',
  isAuth(),
  isUserBucketWithSlug({
    query: 'bucket',
  }),
  SubmissionController.getSubmissionsByFormSlug,
);

SubmissionRouter.get(
  '/',
  isAuth(),
  isUserBucketWithId({
    query: 'bucket',
  }),
  SubmissionController.getSubmissionsByFormId,
);

SubmissionRouter.post(
  '/delete',
  isAuth(),
  SubmissionController.deleteSubmission,
);

OpenSubmissionRouter.route('/:id')
  .all(hasAccessToken())
  .get(SubmissionController.externalGetSubmission);

OpenSubmissionRouter.route('/:id/update')
  .all(hasAccessToken())
  .post(SubmissionController.externalUpdateSubmission)
  .put(SubmissionController.externalUpdateSubmission);

OpenSubmissionRouter.route('/:id/delete')
  .all(hasAccessToken())
  .post(SubmissionController.externalRemoveSubmissions)
  .delete(SubmissionController.externalRemoveSubmissions);

export default SubmissionRouter;
