import { sendResponse } from '../../utils/send-response.util';
import SubmissionService from './submission.service';
import { Request, Response } from 'express';
import { RequestWithAuth } from '../auth';
import { RequestWithBucket } from '../bucket';

class SubmissionController {
  async getSubmissionsByFormSlug(
    req: RequestWithAuth & RequestWithBucket,
    res: Response,
  ): Promise<void> {
    try {
      const { bucket, limit = 10, page = 1 } = req.query;
      const user = req.user.userID;
      const submissions = await SubmissionService.findAllSubmissions({
        limit: Number(limit),
        page: Number(page),
        bucketId: req.bucket._id.toString(),
        user,
      });
      return sendResponse({
        res,
        message: 'Submissions found',
        success: true,
        data: submissions,
        status: 200,
      });
    } catch (error) {
      console.log({ error });
      return sendResponse({
        res,
        message: 'Internal Server Error',
        success: false,
        error,
        status: 500,
      });
    }
  }
  async getSubmissionsByFormId(
    req: RequestWithAuth,
    res: Response,
  ): Promise<void> {
    try {
      const { bucket, limit = 10, page = 1 } = req.query;
      const user = req.user.userID;
      const submissions = await SubmissionService.findAllSubmissions({
        limit: Number(limit),
        page: Number(page),
        bucketId: bucket as string,
        user,
      });
      return sendResponse({
        res,
        message: 'Submissions found',
        success: true,
        data: submissions,
        status: 200,
      });
    } catch (error) {
      console.log({ error });
      return sendResponse({
        res,
        message: 'Internal Server Error',
        success: false,
        error,
        status: 500,
      });
    }
  }

  async externalGetSubmission(
    req: RequestWithBucket,
    res: Response,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const bucket = req.bucket._id;
      const submission = await SubmissionService.getSubmission({
        id,
        bucket,
      });

      if (!submission) {
        return sendResponse({
          res,
          message: 'You are not authorised or submission does not exist',
          success: false,
          status: 404,
        });
      }
      return sendResponse({
        res,
        message: 'Submission found',
        success: true,
        data: submission,
        status: 200,
      });
    } catch (error) {
      console.log({ error });
      return sendResponse({
        res,
        message: 'Internal Server Error',
        success: false,
        error,
        status: 500,
      });
    }
  }
  async externalUpdateSubmission(
    req: RequestWithBucket,
    res: Response,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const bucket = req.bucket.id;
      const submissions = await SubmissionService.externalUpdateSubmission({
        id,
        bucket,
        updateData,
      });
      return sendResponse({
        res,
        message: 'Submissions updated',
        success: true,
        data: submissions,
        status: 200,
      });
    } catch (error) {
      console.log({ error });
      return sendResponse({
        res,
        message: 'Internal Server Error',
        success: false,
        error,
        status: 500,
      });
    }
  }

  async externalRemoveSubmissions(
    req: RequestWithBucket,
    res: Response,
  ): Promise<void> {
    try {
      const { id, ids: idsString } = req.params;
      const ids = idsString.split(',');
      const bucket = req.bucket.id;
      const submissions = await SubmissionService.externalRemoveSubmissions(
        ids ?? [id],
        bucket,
      );
      return sendResponse({
        res,
        message: 'Submissions deleted',
        success: true,
        data: submissions,
        status: 200,
      });
    } catch (error) {
      console.log({ error });
      return sendResponse({
        res,
        message: 'Internal Server Error',
        success: false,
        error,
        status: 500,
      });
    }
  }
  async deleteSubmission(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body;
      await SubmissionService.removeSubmissions(ids);
      return sendResponse({
        res,
        success: true,
        message: 'Submission(s) deleted',
        status: 200,
      });
    } catch (error) {
      return sendResponse({
        res,
        message: 'Internal Server Error',
        success: false,
        status: 500,
      });
    }
  }
}

export default new SubmissionController();
