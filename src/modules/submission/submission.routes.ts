import express, { Router } from 'express';

import SubmissionController from './submission.controller';
import {
  isUserBucketWithId,
  isUserBucketWithSlug,
} from '../bucket/guards/user-bucket.guard';
import { isAuth } from '../auth/guards/auth.guard';

const SubmissionRouter: Router = express.Router();

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

export default SubmissionRouter;
