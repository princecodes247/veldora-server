import { Injectable } from '@nestjs/common';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { UpdateBucketDto } from './dto/update-bucket.dto';

@Injectable()
export class BucketService {
  create(createBucketDto: CreateBucketDto) {
    return 'This action adds a new bucket';
  }

  findAll() {
    return `This action returns all bucket`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bucket`;
  }

  update(id: number, updateBucketDto: UpdateBucketDto) {
    return `This action updates a #${id} bucket`;
  }

  remove(id: number) {
    return `This action removes a #${id} bucket`;
  }
}
