import { CreateSubmissionDto } from './../submission/dto/create-submission.dto';
import { Injectable, Logger } from '@nestjs/common';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { UpdateBucketDto } from './dto/update-bucket.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FlatRecord, Model } from 'mongoose';
import { Bucket, BucketDocument } from './schemas/bucket.schema';
import { PaginationDto, PaginationResult } from './dto/pagination.dto';
import { SubmissionService } from 'src/submission/submission.service';
import { AnalyticsData } from 'src/interfaces';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class BucketService {
  private readonly logger = new Logger(BucketService.name);
  constructor(
    private submissionService: SubmissionService,
    private readonly httpService: HttpService,
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
  ): Promise<PaginationResult<BucketDocument>> {
    const { page, limit = 1 } = pagination;
    const skip = page ? (page - 1) * limit : 0;
    const total = await this.bucketModel.countDocuments();
    const buckets = await this.bucketModel.aggregate([
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'submissions',
          let: { bucketId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: [{ $toObjectId: '$bucket' }, '$$bucketId'] },
              },
            },
          ],
          as: 'submissionsCount',
        },
      },
      {
        $addFields: {
          submissionsCount: { $size: '$submissionsCount' },
        },
      },
    ]);

    const totalPages = Math.ceil(total / limit);

    const meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    } = {
      total,
      page,
      limit,
      totalPages,
    };

    return { data: buckets, meta };
  }

  async findAllUserBuckets(
    pagination: PaginationDto,
    owner: string,
  ): Promise<PaginationResult<BucketDocument>> {
    const { page, limit = 1 } = pagination;
    const skip = page ? (page - 1) * limit : 0;
    const total = await this.bucketModel.countDocuments();
    const buckets = await this.bucketModel.aggregate([
      {
        $match: {
          owner,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'submissions',
          let: { bucketId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: [{ $toObjectId: '$bucket' }, '$$bucketId'] },
              },
            },
          ],
          as: 'submissionsCount',
        },
      },
      {
        $addFields: {
          submissionsCount: { $size: '$submissionsCount' },
        },
      },
    ]);

    const totalPages = Math.ceil(total / limit);

    const meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    } = {
      total,
      page,
      limit,
      totalPages,
    };

    return { data: buckets, meta };
  }

  async findOne(id: string): Promise<Bucket & { stats: AnalyticsData }> {
    try {
      const bucket = await this.bucketModel.findById(id).lean();
      // .populate('submissions')

      console.log({ bucket });

      if (!bucket) {
        throw new Error('Bucket not found');
      }

      const stats = {
        ...(await this.submissionService.getBucketStats(bucket._id.toString())),
        views: bucket.views,
      };

      return {
        ...bucket,
        stats,
      };
    } catch (err) {
      throw new Error('Bucket not found');
    }
  }

  async addViewToBucket(
    bucketId: string,
    data: {
      ip: string;
      device: string;
      platform: string;
    },
  ): Promise<void> {
    const bucket = await this.bucketModel.findById(bucketId).exec();

    if (!bucket) {
      throw new Error('Bucket not found');
    }

    const { data: result } = await firstValueFrom(
      this.httpService
        .get<{
          ip: string;
          ip_number: string;
          ip_version: number;
          country_name: string;
          country_code2: string;
          isp: string;
          response_code: '200';
          response_message: string;
        }>('https://api.iplocation.net/?ip=' + data.ip)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    // console.log({ result });
    await this.bucketModel
      .findByIdAndUpdate(bucketId, {
        $push: {
          views: {
            country: result.country_name,
            countryCode: result.country_code2,
            isp: result.isp,
            ip: data.ip,
            device: data.device,
            platform: data.platform,
          },
        },
      })
      .exec();
  }

  update(id: number, updateBucketDto: UpdateBucketDto) {
    return `This action updates a #${id} bucket`;
  }

  remove(id: number) {
    return `This action removes a #${id} bucket`;
  }
}
