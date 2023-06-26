import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Response,
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
    const bucket = await this.bucketService.findOne(id);
    return {
      data: bucket,
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBucketDto: UpdateBucketDto) {
    return this.bucketService.update(+id, updateBucketDto);
  }

  @Get(':bucketId/view')
  async viewBucket(
    @Param('bucketId') bucketId: string,
    @Request() req,
    @Response() res,
  ): Promise<void> {
    const { country, device } = this.extractDeviceInfo(req);
    // await this.bucketService.addViewToBucket(bucketId);
    console.log({ country, device });
    res.set('Content-Type', 'image/png');
    res.send(
      Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64',
      ),
    );
  }

  @Post(':id/submit')
  submit(@Param('id') formId: string, @Body() submissionData: any) {
    return this.bucketService.submit({
      bucket: formId,
      data: submissionData,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bucketService.remove(+id);
  }

  private extractDeviceInfo(@Request() req): {
    country: string;
    device: string;
  } {
    // Retrieve the device and country information from the request, for example:
    const device =
      req.header('User-Agent') || req.header('sec-ch-ua') || 'Unknown Device';
    const country = req.header('X-Country') || 'Unknown Country';
    const ip = req.ip || 'Unknown IP';
    // const uaParser = new UAParser(device);
    const platform = this.parsePlatform(device);
    console.log({
      device,
      country,
      ip,
      platform,
    });
    return { country, device };
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
