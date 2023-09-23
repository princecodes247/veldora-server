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

  async generateSlugs(req: RequestWithAuth, res: Response) {
    try {
      await BucketService.generateSlugsForExistingBuckets();
      return sendResponse({
        res,
        message: 'Slugs generated',
        success: true,
        status: StatusCodes.CREATED,
      });
    } catch (error) {
      return sendResponse({
        res,
        message: 'Could not generate slugs',
        success: false,
        error: error?.message ?? error,
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
      console.log({ error });
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
  async findOneBySlug(req: Request, res: Response) {
    try {
      const slug: string = req.params.slug;
      const bucket = await BucketService.findOneBySlug(slug);

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
        error: error?.message ?? error,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async update(req: RequestWithAuth, res: Response) {
    try {
      const { bucketId } = req.params;
      const updateBucketDto = req.body;
      const result = await BucketService.update(
        bucketId,
        updateBucketDto,
        req.user.userID,
      );

      return sendResponse({
        res,
        message: 'Bucket Updated',
        success: true,
        data: result,
        status: StatusCodes.CREATED,
      });
    } catch (error) {
      return sendResponse({
        res,
        message: 'Failed to update bucket',
        success: false,
        error: error?.message ?? error,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async viewBucket(req: Request, res: Response) {
    try {
      const { bucketId } = req.params;
      const { device, ip, platform } = extractDeviceInfo(req);
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
      return sendResponse({
        res,
        message: 'Unable to get image',
        success: false,
        error: error?.message ?? error,
        status: StatusCodes.SERVICE_UNAVAILABLE,
      });
    }
  }

  async viewBucketBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const { device, ip, platform } = extractDeviceInfo(req);
      console.log({ device, ip, platform });
      await BucketService.addViewToBucketBySlug(slug, {
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
      return sendResponse({
        res,
        message: 'Unable to get image',
        success: false,
        error: error?.message ?? error,
        status: StatusCodes.SERVICE_UNAVAILABLE,
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

      return sendResponse({
        res,
        message: 'Whitelist updated',
        success: true,
        data: updatedBucket,
        status: StatusCodes.OK,
      });
    } catch (error) {
      return sendResponse({
        res,
        message: 'Bucket not found',
        success: false,
        error: error?.message ?? error,
        status: StatusCodes.NOT_FOUND,
      });
    }
  }

  async submit(req: Request, res: Response) {
    try {
      const { bucketId } = req.params;
      const redirectParam = req.query.redirect as string;
      const { device, ip, platform, host } = extractDeviceInfo(req);
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
        return sendResponse({
          res,
          message: 'Submission successful',
          success: true,
          data: { _id, bucket, data, submissionTime },
          status: StatusCodes.OK,
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
      return sendResponse({
        res,
        message: 'Could not submit form data',
        success: false,
        error: error?.message ?? error,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async submitBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const redirectParam = req.query.redirect as string;
      const { device, ip, platform, host } = extractDeviceInfo(req);
      console.log({ device, ip, platform });
      const { bucket, submission } = await BucketService.submitSlug({
        bucket: slug,
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
        return sendResponse({
          res,
          message: 'Submission successful',
          success: true,
          data: { _id, bucket, data, submissionTime },
          status: StatusCodes.OK,
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
      return sendResponse({
        res,
        message: 'Could not submit form data',
        success: false,
        error: error?.message ?? error,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async remove(req: RequestWithAuth, res: Response) {
    try {
      const { bucketId } = req.params;
      const bucket = await BucketService.remove(bucketId, req.user.userID);
      if (!bucket) {
        return sendResponse({
          res,
          message: "Couldn't find bucket",
          success: true,
          status: StatusCodes.NOT_FOUND,
        });
      }
      return sendResponse({
        res,
        message: 'Bucket Deleted',
        success: true,

        status: StatusCodes.OK,
      });
    } catch (error) {
      return sendResponse({
        res,
        message: 'Could not submit form data',
        success: false,
        error: error?.message ?? error,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}

function extractDeviceInfo(req: Request): {
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
  const platform = parsePlatform(device);
  console.log({ header: req.headers });
  return { platform, ip, device, host };
}

function parsePlatform(userAgent: string): string {
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

export default new BucketController();
