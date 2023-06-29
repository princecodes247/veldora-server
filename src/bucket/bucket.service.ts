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

  async submit({
    bucket,
    data,
    meta,
  }: {
    bucket: string;
    data: string;
    meta?: {
      device: string;
      ip: string;
      platform: string;
    };
  }) {
    const bucketDoc = await this.bucketModel.findById(bucket);
    if (!bucketDoc) {
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
        }>('https://api.iplocation.net/?ip=' + meta.ip)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    // console.log({ result });
    const submission = await this.submissionService.create({
      bucket,
      data,
      meta: {
        country: result.country_name,
        countryCode: result.country_code2,
        isp: result.isp,
        ip: meta.ip,
        device: meta.device,
        platform: meta.platform,
      },
    });
    return {
      bucket: bucketDoc.toObject(),
      submission,
    };
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

  async update(id: string, updateBucketDto: UpdateBucketDto, user: string) {
    const bucket = await this.bucketModel.findById(id).exec();
    if (!bucket) {
      throw new Error('Bucket not found');
    }
    if (bucket.owner !== user) {
      throw new Error('You are not the owner of this bucket');
    }
    // Check if responseStyle is custom and if so, check if redirectUrl is provided
    if (
      updateBucketDto.responseStyle === 'custom' &&
      !updateBucketDto.customRedirect
    ) {
      throw new Error('redirectUrl is required when responseStyle is custom');
    }
    // Update bucket name, description, redirectUrl, responseStyle
    this.bucketModel.findByIdAndUpdate(id, updateBucketDto).exec();
  }

  async remove(id: string, user: string) {
    const bucket = await this.bucketModel.findById(id).exec();
    if (!bucket) {
      throw new Error('Bucket not found');
    }
    if (bucket.owner !== user) {
      throw new Error('You are not the owner of this bucket');
    }
    return this.bucketModel.findByIdAndDelete(id).exec();
  }
}
