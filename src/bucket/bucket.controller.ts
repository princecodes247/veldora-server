import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  UseGuards,
  Request,
  Response,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BucketService } from './bucket.service';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { UpdateBucketDto } from './dto/update-bucket.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ConfigService } from '@nestjs/config';
import { RegenerateAccessTokenDTO } from './dto/regenerate-access-token.dto';
import { BucketGuard } from './bucket.guard';
import { SubmissionService } from 'src/submission/submission.service';

@Controller({
  path: 'buckets',
  version: '1',
})
export class BucketController {
  constructor(
    private readonly bucketService: BucketService,
    private readonly submissionService: SubmissionService,
    private configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Request() req, @Body() createBucketDto: CreateBucketDto) {
    return this.bucketService.create({
      ...createBucketDto,
      owner: req.user.userID,
    });
  }

  @Post('regenerate-access-token')
  @UseGuards(AuthGuard)
  regenerateAccessToken(
    @Request() req,
    @Body() regenerateAccessTokenDTO: RegenerateAccessTokenDTO,
  ) {
    return this.bucketService.regenerateAccessToken({
      id: regenerateAccessTokenDTO.id,
      user: req.user.userID,
    });
  }

  @Get()
  @UseGuards(AuthGuard)
  findAllUserBuckets(@Request() req) {
    return this.bucketService.findAllUserBuckets(
      {
        page: 1,
        limit: 10,
      },
      req.user.userID,
    );
  }

  @Get('/g')
  @UseGuards(BucketGuard)
  async externalGetBucket(@Request() req, @Param('id') id: string) {
    try {
      const bucket = req.bucket;

      return {
        data: bucket,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Bucket not found',
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Get('/g/rows')
  @UseGuards(BucketGuard)
  async externalGetSubmissions(
    @Request() req,
    @Query('limit') limit: number = 10,
    @Query('page') page?: number,
  ): Promise<any> {
    return this.submissionService.findAll({
      limit,
      page,
      bucketId: req.bucket._id,
      user: req.bucket.owner,
    });
  }

  // @Get('regenerate-access-tokens')
  // async regenerateAccessTokens(): Promise<void> {
  //   await this.bucketService.regenerateAccessTokens();
  // }

  // @Get("all")
  // findAll() {
  //   return this.bucketService.findAll({
  //     page: 1,
  //     limit: 10,
  //   });
  // }

  @Get(':id')
  // @UseGuards(AuthGuard)
  async findOne(@Request() req, @Param('id') id: string) {
    // GUARD FOR USER
    try {
      const bucket = await this.bucketService.findOne(id);
      // if (bucket.owner !== req.user.userID) {
      //   throw new Error('Bucket not found');
      // }
      return {
        data: bucket,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Bucket not found',
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBucketDto: UpdateBucketDto,
  ) {
    // GUARD FOR USER
    return this.bucketService.update(id, updateBucketDto, req.user.userID);
  }

  @Get(':bucketId/view')
  async viewBucket(
    @Param('bucketId') bucketId: string,
    @Request() req,
    @Response() res,
  ): Promise<void> {
    try {
      const { device, ip, platform } = this.extractDeviceInfo(req);
      console.log({ device, ip, platform });
      await this.bucketService.addViewToBucket(bucketId, {
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
      throw new HttpException(
        {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Unable to get image',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
        {
          cause: error,
        },
      );
    }
  }

  @Post(':bucketId/update-whitelist')
  @UseGuards(AuthGuard)
  async updateWhiteList(
    @Param('bucketId') bucketId: string,
    @Request() req,
    @Body() body: any,
  ) {
    try {
      const bucket = await this.bucketService.findOne(bucketId);
      if (bucket.owner !== req.user.userID) {
        throw new Error('Bucket not found');
      }
      console.log({ body: body.whiteList });
      return this.bucketService.updateWhitelist(bucketId, body.whiteList);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Bucket not found',
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Post(':id')
  async submit(
    @Param('id') formId: string,
    @Query('redirect') redirectParam: string,
    @Body() submissionData: any,
    @Request() req,
    @Response() res,
  ) {
    try {
      const { device, ip, platform, host } = this.extractDeviceInfo(req);
      console.log({ device, ip, platform });
      const { bucket, submission } = await this.bucketService.submit({
        bucket: formId,
        data: submissionData,
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
      const clientURL = this.configService.get('CLIENT_URL');
      return res.redirect(clientURL + '/successful');
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Could not submit form data',
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.bucketService.remove(id, req.user.userID);
  }

  private extractDeviceInfo(@Request() req): {
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

    // const uaParser = new UAParser(device);
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
