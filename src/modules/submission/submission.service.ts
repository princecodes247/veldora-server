import { PaginationResult } from '../../interfaces/bucket.interfaces';
import { BucketService } from '../bucket';
import SubmissionModel, { SubmissionDocument } from './models/submission.model';

class SubmissionService {
  async createSubmission(createSubmissionDto) {
    const submission = new SubmissionModel(createSubmissionDto);
    return await submission.save();
  }

  async findAllSubmissions({
    limit = 10,
    page = 1,
    bucketId,
    user,
  }): Promise<PaginationResult<SubmissionDocument>> {
    const query = {};

    if (bucketId) {
      query['bucket'] = bucketId;
    }

    // const bucket = await BucketService.findOne(bucketId);

    // if (!bucket) {
    //   throw new Error('Bucket not found');
    // }

    // if (bucket.owner !== user) {
    //   throw new Error('You are not the owner of this bucket');
    // }

    const skip = (Math.max(page, 1) - 1) * limit;
    const submissions = await SubmissionModel.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit + 1)
      .lean()
      .exec();
    const submissionCount = await SubmissionModel.countDocuments(query).exec();
    const hasNextPage = submissionCount > limit;
    return {
      result: submissions,
      meta: {
        pages: Math.ceil(submissionCount / limit),
        total: submissionCount,
        limit,
        page,
        hasNextPage,
        nextPage: hasNextPage ? page + 1 : null,
      },
    };
  }

  async getBucketStats(bucketId) {
    const submissionStats = await SubmissionModel.aggregate([
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

  async removeSubmissions(ids) {
    return await SubmissionModel.deleteMany({ _id: { $in: ids } });
  }
}

export default new SubmissionService();
