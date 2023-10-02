import { CreateBucketDto } from './dto/create-bucket.dto';
import { UpdateBucketDto } from './dto/update-bucket.dto';
import { Model, Document } from 'mongoose';
import BucketModel, { IBucket } from './models/bucket.model';

import { SubmissionService } from '../submission';
import axios, { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  PaginationDto,
  PaginationMeta,
  PaginationResult,
} from '../../interfaces/bucket.interfaces';

class BucketService {
  constructor(private readonly bucketModel: Model<IBucket>) {}

  checkBucketAccess(bucket: Document, accessToken: string) {
    if (bucket.get('accessToken') !== accessToken) {
      throw new Error('Access token is invalid');
    }
  }

  async create(createBucketDto: CreateBucketDto) {
    const bucket = new this.bucketModel({
      ...createBucketDto,
      accessToken: this.generateAccessToken(),
    });
    return await bucket.save();
  }

  async submitSlug({
    bucket,
    data,
    meta,
  }: {
    bucket: IBucket;
    data: string;
    meta?: {
      device: string;
      ip: string;
      platform: string;
      host: string;
    };
  }) {
    // if (!this.isInBucketWhiteList(bucketDoc, meta.host)) {
    //   throw new Error('Domain not allowed');
    // }

    // Implement the HTTP request here
    const { data: result } = await axios.get<{
      ip: string;
      ip_number: string;
      ip_version: number;
      country_name: string;
      country_code2: string;
      isp: string;
    }>('https://api.iplocation.net/?ip=' + (meta?.ip ?? ''));

    const submission = await SubmissionService.createSubmission({
      bucket: bucket._id,
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
      bucket,
      submission,
    };
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
      host: string;
    };
  }) {
    const bucketDoc = await this.bucketModel.findById(bucket);
    if (!bucketDoc) {
      throw new Error('Bucket not found');
    }

    if (!this.isInBucketWhiteList(bucketDoc, meta.host)) {
      throw new Error('Domain not allowed');
    }

    // Implement the HTTP request here
    // ...

    const submission = await SubmissionService.createSubmission({
      bucket,
      data,
      meta: {
        country: 'result.country_name',
        countryCode: 'result.country_code2',
        isp: 'result.isp',
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

  async findAll(pagination: PaginationDto): Promise<PaginationResult<IBucket>> {
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

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      pages: totalPages,
      hasNextPage: totalPages > page,
      nextPage: totalPages > page ? page + 1 : null,
    };

    return { result: buckets, meta };
  }

  async countUserBuckets(owner: string): Promise<number> {
    try {
      const total = await this.bucketModel.countDocuments({ owner });
      return total;
    } catch (error) {
      return -1;
    }
  }

  async findAllUserBuckets(
    pagination: PaginationDto,
    owner: string,
  ): Promise<PaginationResult<IBucket>> {
    const { page, limit = 1 } = pagination;
    const skip = page ? (page - 1) * limit : 0;
    const total = await this.bucketModel.countDocuments({ owner });
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

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      pages: totalPages,
      hasNextPage: totalPages > page,
      nextPage: totalPages > page ? page + 1 : null,
    };

    return { result: buckets, meta };
  }

  async findOne(id: string): Promise<(IBucket & { stats?: any }) | null> {
    try {
      const bucket = await this.bucketModel.findById(id).lean();
      // .populate('submissions')

      console.log({ bucket });

      if (!bucket) {
        return null;
      }

      const stats = {
        ...(await SubmissionService.getBucketStats(bucket._id.toString())),
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

  async findOneBySlug(
    slug: string,
  ): Promise<(IBucket & { stats?: any }) | null> {
    try {
      const bucket = await this.bucketModel.findOne({ slug }).lean();
      // .populate('submissions')

      if (!bucket) {
        return null;
      }

      const stats = {
        ...(await SubmissionService.getBucketStats(bucket._id.toString())),
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

  async findByAccessToken(token: string): Promise<IBucket & { stats?: any }> {
    try {
      const bucket = await this.bucketModel
        .findOne({ accessToken: token })
        .lean();
      // .populate('submissions')

      console.log({ bucket });

      if (!bucket) {
        throw new Error('Bucket not found');
      }

      const stats = {
        ...(await SubmissionService.getBucketStats(bucket._id.toString())),
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

    // Implement the HTTP request here to get location data based on the IP address
    // Example:
    // const result = await axios.get(`https://api.iplocation.net/?ip=${data.ip}`);
    // const resultData = result.data;

    const resultData = {
      country_name: 'Country Name',
      country_code2: 'CC',
      isp: 'ISP Name',
    }; // Replace with actual data from the HTTP request

    await this.bucketModel.findByIdAndUpdate(bucketId, {
      $push: {
        views: {
          country: resultData.country_name,
          countryCode: resultData.country_code2,
          isp: resultData.isp,
          ip: data.ip,
          device: data.device,
          platform: data.platform,
        },
      },
    });
  }

  async addViewToBucketBySlug(
    slug: string,
    data: {
      ip: string;
      device: string;
      platform: string;
    },
  ): Promise<void> {
    const bucket = await this.bucketModel.findOne({ slug }).exec();

    if (!bucket) {
      throw new Error('Bucket not found');
    }

    // Implement the HTTP request here to get location data based on the IP address
    // Example:
    // const result = await axios.get(`https://api.iplocation.net/?ip=${data.ip}`);
    // const resultData = result.data;

    const resultData = {
      country_name: 'Country Name',
      country_code2: 'CC',
      isp: 'ISP Name',
    }; // Replace with actual data from the HTTP request

    await this.bucketModel.findOneAndUpdate(
      { slug },
      {
        $push: {
          views: {
            country: resultData.country_name,
            countryCode: resultData.country_code2,
            isp: resultData.isp,
            ip: data.ip,
            device: data.device,
            platform: data.platform,
          },
        },
      },
    );
  }

  async update(id: string, updateBucketDto: UpdateBucketDto, user: string) {
    const bucket = await this.bucketModel.findById(id).exec();
    if (!bucket) {
      throw new Error('Bucket not found');
    }
    if (bucket.owner.toString() !== user) {
      throw new Error('You are not the owner of this bucket');
    }

    const { customRedirect, description, name, responseStyle } =
      updateBucketDto;
    // Check if responseStyle is custom and if so, check if customRedirect is provided
    if (responseStyle === 'custom' && !customRedirect) {
      throw new Error(
        'customRedirect is required when responseStyle is custom',
      );
    }
    // Update bucket name, description, customRedirect, responseStyle
    return await this.bucketModel.findByIdAndUpdate(
      id,
      {
        customRedirect,
        description,
        name,
        responseStyle,
      },
      {
        new: true,
      },
    );
  }

  async updateBucketStructure(
    id: string,
    structure: Array<{
      name: string;
      type?: string;
    }>,
    user: string,
  ) {
    const bucket = await this.bucketModel.findById(id).exec();
    if (!bucket) {
      throw new Error('Bucket not found');
    }
    if (bucket.owner.toString() !== user) {
      throw new Error('You are not the owner of this bucket');
    }
    console.log({ structure });

    // Update bucket structure
    return await this.bucketModel.findByIdAndUpdate(
      id,
      {
        structure: structure.length > 0 ? structure : undefined,
      },
      {
        new: true,
      },
    );
  }

  async remove(id: string, user: string) {
    const bucket = await this.bucketModel.findById(id).exec();
    if (!bucket) {
      throw new Error('Bucket not found');
    }
    if (bucket.owner.toString() !== user) {
      throw new Error('You are not the owner of this bucket');
    }
    return await this.bucketModel.findByIdAndDelete(id).exec();
  }

  async regenerateAccessToken({ id, user }: { id: string; user: string }) {
    const bucket = await this.bucketModel.findById(id).exec();
    if (!bucket) {
      throw new Error('Bucket not found');
    }

    if (bucket.owner.toString() !== user) {
      throw new Error('You are not the owner of this bucket');
    }

    const accessToken = this.generateAccessToken();

    bucket.accessToken = accessToken;
    await bucket.save();
    return accessToken;
  }

  async updateWhitelist(id: string, whiteList: string[]) {
    const bucket = await this.bucketModel.findById(id).exec();
    if (!bucket) {
      throw new Error('Bucket not found');
    }

    bucket.whiteList = whiteList;
    await bucket.save();

    return bucket;
  }

  private generateAccessToken() {
    return uuidv4();
  }

  // Function to generate slugs for existing buckets
  async generateSlugsForExistingBuckets() {
    const regex = /-$/;
    const bucketsWithoutSlugs = await BucketModel.find({
      // slug: { $exists: false },
      slug: regex,
      name: { $exists: true },
    });

    for (const bucket of bucketsWithoutSlugs) {
      const slug = bucket.name.toLowerCase().replace(/\s+/g, '-');
      bucket.slug = slug;
      await bucket.save();
      console.log(`Generated slug "${slug}" for bucket "${bucket.name}"`);
    }

    console.log('Finished generating slugs for existing buckets.');
  }

  isInBucketWhiteList(bucket: IBucket, host: string) {
    if (bucket.whiteList.length === 0) {
      return true;
    }
    console.log({ host });
    return (
      bucket.whiteList.includes('https://' + host) ||
      bucket.whiteList.includes('http://' + host)
    );
  }

  async regenerateAccessTokens(): Promise<void> {
    // Implement the regenerateAccessTokens method here
    // ...
  }
}

export default new BucketService(BucketModel);
