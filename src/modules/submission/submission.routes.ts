import express, { Router } from 'express';

import SubmissionController from './submission.controller';
import { isAuth } from '../auth';

const SubmissionRouter: Router = express.Router();

SubmissionRouter.get(
  '/',
  isAuth(),
  SubmissionController.getSubmissionsByFormId,
);

SubmissionRouter.post(
  '/delete',
  isAuth(),
  SubmissionController.deleteSubmission,
);

export default SubmissionRouter;
