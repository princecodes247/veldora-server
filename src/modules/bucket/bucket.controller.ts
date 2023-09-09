import { Request, Response } from 'express';
import BucketService from './bucket.service';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { RegenerateAccessTokenDTO } from './dto/regenerate-access-token.dto';
import { sendResponse } from '../../utils/send-response.util';
import { StatusCodes } from 'http-status-codes';
import { SubmissionService } from '../submission';
import { RequestWithAuth } from '../auth/auth.type';
import { RequestWithBucket } from './bucket.type';
import { CLIENT_URL } from '../../config/env.config';

class BucketController {
  async create(req: RequestWithAuth, res: Response) {
    try {
      const createBucketDto: CreateBucketDto = req.body;
      const bucket = await BucketService.create({
        ...createBucketDto,
        owner: req.user.userID,
      });

      return sendResponse({
        res,
        message: 'Bucket created',
        success: true,
        data: bucket,
        status: StatusCodes.CREATED,
      });
    } catch (error) {
      return sendResponse({
        res,
        message: 'Could not create Bucket',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async regenerateAccessToken(req: RequestWithAuth, res: Response) {
    try {
      const regenerateAccessTokenDTO: RegenerateAccessTokenDTO = req.body;
      const result = await BucketService.regenerateAccessToken({
        id: regenerateAccessTokenDTO.id,
        user: req.user.userID,
      });

      return sendResponse({
        res,
        message: 'Bucket access token updated',
        success: true,
        data: result,
        status: StatusCodes.CREATED,
      });
    } catch (error) {
      return sendResponse({
        res,
        message: 'Could not update access token',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findAll(req: RequestWithAuth, res: Response) {
    try {
      const buckets = await BucketService.findAll({
        page: 1,
        limit: 10,
      });
      return sendResponse({
        res,
        message: 'Buckets found',
        success: true,
        data: buckets,
        status: StatusCodes.OK,
      });
    } catch (error) {
      console.log({ error });
      return sendResponse({
        res,
        message: 'Could not fetch buckets',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error?.message ?? '',
      });
    }
  }

  async findAllUserBuckets(req: RequestWithAuth, res: Response) {
    try {
      const userBuckets = await BucketService.findAllUserBuckets(
        {
          page: 1,
          limit: 10,
        },
        req.user.userID,
      );
      return sendResponse({
        res,
        message: 'Buckets found',
        success: true,
        data: userBuckets,
        status: StatusCodes.OK,
      });
    } catch (error) {
      return sendResponse({
        res,
        message: 'Could not fetch buckets',
        success: false,
        error,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const id: string = req.params.bucketId;
      const bucket = await BucketService.findOne(id);

      if (!bucket) {
        return sendResponse({
          res,
          message: 'Bucket not found',
          success: false,
          status: StatusCodes.NOT_FOUND,
        });
      }

      return sendResponse({
        res,
        message: 'Bucket found',
        success: true,
        data: bucket,
        status: StatusCodes.OK,
      });
    } catch (error) {
      return sendResponse({
        res,
        message: '',
        success: false,
        status: StatusCodes.FORBIDDEN,
        error: error.message,
      });
    }
  }

  async externalGetBucket(
    req: Request & {
      bucket: string;
    },
    res: Response,
  ) {
    try {
      const bucket = req.bucket;
      return sendResponse({
        res,
        message: 'Bucket found',
        success: true,
        data: bucket,
        status: StatusCodes.OK,
      });
    } catch (error) {
      return sendResponse({
        res,
        message: 'Could not find Bucket',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async externalGetSubmissions(req: RequestWithBucket, res: Response) {
    try {
      const { limit = 10, page } = req.query;
      const pageAsNumber = parseInt((page ?? '0') as string);
      const limitAsNumber = parseInt((limit ?? '10') as string);
      const submissions = await SubmissionService.findAllSubmissions({
        limit: limitAsNumber,
        page: pageAsNumber,
        bucketId: req.bucket._id,
        user: req.bucket.owner,
      });
      return sendResponse({
        res,
        message: 'Bucket submissions found',
        success: true,
        data: submissions,
        status: StatusCodes.OK,
      });
    } catch (error) {
      return sendResponse({
        res,
        message: 'Could not find Bucket',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async update(req: RequestWithAuth, res: Response) {
    try {
      const { id } = req.params;
      const updateBucketDto = req.body;
      const result = await BucketService.update(
        id,
        updateBucketDto,
        req.user.userID,
      );
      return res.json(result);
    } catch (error) {
      return res.status(403).json({
        status: 403,
        error: 'Failed to update bucket',
        cause: error.message,
      });
    }
  }

  async viewBucket(req: Request, res: Response) {
    try {
      const { bucketId } = req.params;
      const { device, ip, platform } = this.extractDeviceInfo(req);
      console.log({ device, ip, platform });
      await BucketService.addViewToBucket(bucketId, {
        device,
        ip,
        platform,
      });
      res.set('Content-Type', 'image/png');
      res.send(
        Buffer.from(
          'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          'base64',
        ),
      );
    } catch (error) {
      return res.status(503).json({
        status: 503,
        error: 'Unable to get image',
        cause: error.message,
      });
    }
  }

  async updateWhiteList(req: RequestWithAuth, res: Response) {
    try {
      const bucketId: string = req.params.bucketId;
      const bucket = await BucketService.findOne(bucketId);
      if (bucket.owner.toString() !== req.user.userID) {
        throw new Error('Bucket not found');
      }
      console.log({ body: req.body.whiteList });
      // Handle the updateWhitelist logic here
      const updatedBucket = await BucketService.updateWhitelist(
        bucketId,
        req.body.whiteList,
      );
      res.status(200).json({ message: 'Whitelist updated' });
    } catch (error) {
      res
        .status(403)
        .json({ status: 403, error: 'Bucket not found', cause: error });
    }
  }

  async submit(req: Request, res: Response) {
    try {
      const { bucketId } = req.params;
      const redirectParam = req.query.redirect as string;
      const { device, ip, platform, host } = this.extractDeviceInfo(req);
      console.log({ device, ip, platform });
      const { bucket, submission } = await BucketService.submit({
        bucket: bucketId,
        data: req.body,
        meta: {
          device,
          ip,
          platform,
          host,
        },
      });
      if (bucket.responseStyle === 'json') {
        const { _id, bucket, data, submissionTime } = submission.toObject();
        return res.json({
          data: {
            message: 'Submission successful',
            submission: { _id, bucket, data, submissionTime },
          },
        });
      }

      if (bucket.responseStyle === 'custom') {
        return res.redirect(bucket.customRedirect);
      }

      if (bucket.responseStyle === 'params') {
        return res.redirect(redirectParam || bucket.customRedirect);
      }

      console.log('data');
      const clientURL = CLIENT_URL;
      return res.redirect(clientURL + '/successful');
    } catch (error) {
      res.status(400).json({ error: 'Could not submit form data' });
    }
  }

  remove(req: RequestWithAuth) {
    const { bucketId } = req.params;
    return BucketService.remove(bucketId, req.user.userID);
  }

  private extractDeviceInfo(req: Request): {
    ip: string;
    device: string;
    platform: string;
    host: string;
  } {
    // Retrieve the device and country information from the request, for example:
    const device =
      req.header('User-Agent') || req.header('sec-ch-ua') || 'Unknown Device';
    const ip = req.header('true-client-ip') || 'Unknown IP';
    const host = req.header('host') || 'Unknown Host';
    const platform = this.parsePlatform(device);
    console.log({ header: req.headers });
    return { platform, ip, device, host };
  }

  private parsePlatform(userAgent: string): string {
    let platform = 'Unknown Platform';

    if (userAgent.includes('Windows')) {
      platform = 'Windows';
    } else if (userAgent.includes('Macintosh')) {
      platform = 'Macintosh';
    } else if (userAgent.includes('Linux')) {
      platform = 'Linux';
    } else if (userAgent.includes('Android')) {
      platform = 'Android';
    } else if (userAgent.includes('iOS')) {
      platform = 'iOS';
    }

    return platform;
  }
}

export default new BucketController();