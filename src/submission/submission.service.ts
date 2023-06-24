import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Submission, SubmissionDocument } from './schemas/submission.schema';
import { PaginationCursorDto, PaginationDto } from './dto/pagination.dto';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectModel(Submission.name) private submissionModel: Model<Submission>,
  ) {}

  create(createSubmissionDto: CreateSubmissionDto) {
    return new this.submissionModel(createSubmissionDto).save();
  }

  // async findAll(limit: number, cursor?: string): Promise<any> {
  //   const query = {};
  //   if (cursor) {
  //     query['_id'] = { $lt: cursor };
  //   }

  //   const submissions = await this.submissionModel
  //     .find(query)
  //     .sort({ _id: -1 })
  //     .limit(limit)
  //     .lean();

  //   const hasNextPage = submissions.length > limit;
  //   const edges = submissions.slice(0, limit).map((submission) => ({
  //     cursor: submission._id.toString(),
  //     node: submission,
  //   }));

  //   return {
  //     pageInfo: {
  //       hasNextPage,
  //       endCursor: hasNextPage ? edges[edges.length - 1].cursor : null,
  //     },
  //     edges,
  //   };
  // }

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
