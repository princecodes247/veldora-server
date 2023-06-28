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

@Controller({
  path: 'buckets',
  version: '1',
})
export class BucketController {
  constructor(private readonly bucketService: BucketService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Request() req, @Body() createBucketDto: CreateBucketDto) {
    return this.bucketService.create({
      ...createBucketDto,
      owner: req.user.userID,
    });
  }

  // @Get("all")
  // findAll() {
  //   return this.bucketService.findAll({
  //     page: 1,
  //     limit: 10,
  //   });
  // }

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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const bucket = await this.bucketService.findOne(id);
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
  update(@Param('id') id: string, @Body() updateBucketDto: UpdateBucketDto) {
    return this.bucketService.update(id, updateBucketDto);
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

  @Post(':id')
  async submit(
    @Param('id') formId: string,
    @Query('redirect') redirectParam: string,
    @Body() submissionData: any,
    @Request() req,
    @Response() res,
  ) {
    try {
      const { device, ip, platform } = this.extractDeviceInfo(req);
      console.log({ device, ip, platform });
      const data = await this.bucketService.submit({
        bucket: formId,
        data: submissionData,
        meta: {
          device,
          ip,
          platform,
        },
      });

      if (data.bucket.responseStyle === 'json') {
        return res.json({
          data: {
            message: 'Submission successful',
            submission: data.submission,
          },
        });
      }

      if (data.bucket.responseStyle === 'custom') {
        return res.redirect(data.bucket.customRedirect);
      }

      if (data.bucket.responseStyle === 'params') {
        return res.redirect(redirectParam || data.bucket.customRedirect);
      }

      console.log('data');
      return res.send('Submission successful');
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
  remove(@Param('id') id: string) {
    return this.bucketService.remove(id);
  }

  private extractDeviceInfo(@Request() req): {
    ip: string;
    device: string;
    platform: string;
  } {
    // Retrieve the device and country information from the request, for example:
    const device =
      req.header('User-Agent') || req.header('sec-ch-ua') || 'Unknown Device';
    const ip = req.header('true-client-ip') || 'Unknown IP';

    // const uaParser = new UAParser(device);
    const platform = this.parsePlatform(device);

    return { platform, ip, device };
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
