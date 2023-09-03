import express, { Request, Response, Router } from 'express';

import { CreateSubmissionDto, DeleteSubmissionDTO } from './dto/submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

import SubmissionController from './submission.controller';

const SubmissionRouter: Router = express.Router();

SubmissionRouter.get('/', SubmissionController.getSubmissionsByFormId);

SubmissionRouter.post('/delete', SubmissionController.deleteSubmission);

export default SubmissionRouter;
