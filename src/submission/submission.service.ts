import { Model, ObjectId } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Submission, SubmissionDocument } from './schemas/submission.schema';
import { PaginationCursorDto, PaginationDto } from './dto/pagination.dto';
import { AnalyticsData } from 'src/interfaces';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectModel(Submission.name) private submissionModel: Model<Submission>,
  ) {}

  create(createSubmissionDto: CreateSubmissionDto) {
    return new this.submissionModel(createSubmissionDto).save();
  }

  async findAll({
    limit = 10,
    cursor,
    bucketId,
  }: {
    limit: number;
    bucketId?: string;
    cursor?: string;
  }): Promise<any> {
    const query = {};
    if (cursor) {
      query['_id'] = { $lt: cursor };
    }
    if (bucketId) {
      query['bucket'] = bucketId;
    }

    const submissions = await this.submissionModel
      .find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    const hasNextPage = submissions.length > limit;
    const edges = submissions.slice(0, limit).map((submission) => ({
      cursor: submission._id.toString(),
      ...submission,
    }));

    return {
      data: edges,
      pageInfo: {
        hasNextPage,
        endCursor: hasNextPage ? edges[edges.length - 1].cursor : null,
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
