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
}
