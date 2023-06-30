import { Model, ObjectId } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Submission, SubmissionDocument } from './schemas/submission.schema';
import { PaginationCursorDto, PaginationDto } from './dto/pagination.dto';
import { AnalyticsData } from 'src/interfaces';
import { Bucket } from 'src/bucket/schemas/bucket.schema';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectModel(Submission.name) private submissionModel: Model<Submission>,
    @InjectModel(Bucket.name) private bucketModel: Model<Bucket>,
  ) {}

  create(createSubmissionDto: CreateSubmissionDto) {
    return new this.submissionModel(createSubmissionDto).save();
  }

  async findAll({
    limit = 10,
    page,
    bucketId,
    user,
  }: {
    limit: number;
    bucketId?: string;
    page?: number;
    user: string;
  }): Promise<any> {
    const query = {};

    if (bucketId) {
      query['bucket'] = bucketId;
    }

    const bucket = await this.bucketModel.findOne({ _id: bucketId });
    if (!bucket) {
      throw new Error('Bucket not found');
    }

    if (bucket.owner !== user) {
      throw new Error('You are not the owner of this bucket');
    }

    const submissions = await this.submissionModel
      .find(query)
      .sort({ _id: -1 })
      .skip(page * limit)
      .limit(limit + 1)
      .lean();
    const submissionCount = await this.submissionModel.countDocuments(query);
    const hasNextPage = submissionCount > limit;

    return {
      data: submissions,
      pageInfo: {
        pages: Math.ceil(submissionCount / limit),
        hasNextPage,
        nextPage: hasNextPage ? page + 1 : null,
      },
    };
  }

  async getBucketStats(bucketId: string): Promise<AnalyticsData> {
    const submissionStats = await this.submissionModel.aggregate([
      { $match: { bucket: bucketId } },
      {
        $facet: {
          submissionCount: [{ $count: 'count' }],
          countries: [
            { $group: { _id: '$meta.country', count: { $sum: 1 } } },
            { $match: { _id: { $ne: null } } },
            { $project: { name: '$_id', count: 1, _id: 0 } },
          ],
          devices: [
            { $group: { _id: '$meta.device', count: { $sum: 1 } } },
            { $match: { _id: { $ne: null } } },
            { $project: { name: '$_id', count: 1, _id: 0 } },
          ],
          dailySubmissions: [
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$submissionTime',
                  },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            { $project: { date: '$_id', count: 1, _id: 0 } },
          ],
        },
      },
      {
        $project: {
          submissionCount: { $arrayElemAt: ['$submissionCount.count', 0] },
          countries: 1,
          devices: 1,
          dailySubmissions: 1,
        },
      },
    ]);

    return submissionStats[0];
  }

  findOne(id: number) {
    return `This action returns a #${id} submission`;
  }

  update(id: number, updateSubmissionDto: UpdateSubmissionDto) {
    return `This action updates a #${id} submission`;
  }

  remove(id: number) {
    return `This action removes a #${id} submission`;
  }
}
