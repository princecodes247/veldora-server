import { StatusCodes } from 'http-status-codes';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { Application, Router } from 'express';
import { sendResponse } from './utils/send-response.util';
import { AuthRouter } from './modules/auth';
import { BucketRouter, OpenBucketRouter } from './modules/bucket';
import { UserRouter } from './modules/user';
import { SubmissionRouter } from './modules/submission';
import hasAccessToken from './modules/bucket/guards/bucket-access-token.guard';

const router: Router = Router();
const openRouter: Router = Router();

router.use('/auth', AuthRouter);
router.use('/buckets', BucketRouter);
router.use('/users', UserRouter);
router.use('/submissions', SubmissionRouter);

openRouter.use('/buckets', OpenBucketRouter);

const routes = (app: Application) => {
  app.use('/api/v1/g', hasAccessToken(), openRouter);
  app.use('/api/v1', router);
  // app.use('/item-image', express.static(path.join(__dirname, '..', 'tmp')));

  // Error handler for 404 - Page Not Found
  app.use((req: Request, res: Response, next) => {
    console.log('---- 404 error handler', req.originalUrl);
    sendResponse({
      res,
      status: StatusCodes.NOT_FOUND,
      message: 'Sorry, page not found!',
      success: false,
    });
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err) {
      sendResponse({
        res,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: err.message,
        success: false,
        // error: err,
      });
      next();
    }
  });
};

export default routes;
