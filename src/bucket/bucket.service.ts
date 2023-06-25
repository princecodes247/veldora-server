import { CreateSubmissionDto } from './../submission/dto/create-submission.dto';
import { Injectable } from '@nestjs/common';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { UpdateBucketDto } from './dto/update-bucket.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bucket, BucketDocument } from './schemas/bucket.schema';
import { PaginationDto } from './dto/pagination.dto';
import { SubmissionService } from 'src/submission/submission.service';

@Injectable()
export class BucketService {
  constructor(
    private submissionService: SubmissionService,
    @InjectModel(Bucket.name) private bucketModel: Model<Bucket>,
  ) {}

  async create(createBucketDto: CreateBucketDto) {
    const bucket = new this.bucketModel(createBucketDto);
    return await bucket.save();
  }

  async submit({ bucket, data }: { bucket: string; data: string }) {
    const submission = await this.submissionService.create({
      bucket,
      data,
    });
    return submission;
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<{ data: BucketDocument[]; total: number }> {
    const { page, limit = 1 } = pagination;
    const skip = page ? (page - 1) * limit : 0;
    const total = await this.bucketModel.countDocuments();
    const buckets = await this.bucketModel.aggregate([
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'submissions',
          let: { bucketId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: [
                { $toObjectId: '$bucket' }, '$$bucketId'] }
              }
            }
          ],
          as: 'submissionsCount'
        }
      },
      {
        $addFields: {
          submissionsCount: { $size: '$submissionsCount' }
        }
      }
    ]);
    
    return { data: buckets, total };
  }

  async findOne(id: string): Promise<BucketDocument> {
    try {
      const bucket = await this.bucketModel.findById(id);
      if (!bucket) {
        throw new Error('Bucket not found');
      }
      return bucket.toObject();
    } catch (err) {
      throw new Error('Bucket not found');
    }
  }

  update(id: number, updateBucketDto: UpdateBucketDto) {
    return `This action updates a #${id} bucket`;
  }

  remove(id: number) {
    return `This action removes a #${id} bucket`;
  }
}
