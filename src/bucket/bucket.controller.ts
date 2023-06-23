import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BucketService } from './bucket.service';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { UpdateBucketDto } from './dto/update-bucket.dto';

@Controller('bucket')
export class BucketController {
  constructor(private readonly bucketService: BucketService) {}

  @Post()
  create(@Body() createBucketDto: CreateBucketDto) {
    return this.bucketService.create(createBucketDto);
  }

  @Get()
  findAll() {
    return this.bucketService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bucketService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBucketDto: UpdateBucketDto) {
    return this.bucketService.update(+id, updateBucketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bucketService.remove(+id);
  }
}
