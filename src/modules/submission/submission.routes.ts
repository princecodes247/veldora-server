import express, { Router } from 'express';

import SubmissionController from './submission.controller';
import { isAuth } from '../auth';
import { isUserBucketWithId } from '../bucket/guards/user-bucket.guard';

const SubmissionRouter: Router = express.Router();

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
