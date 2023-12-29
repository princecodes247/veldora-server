import { PaginationResult } from '../../interfaces/bucket.interfaces';
import { BucketService } from '../bucket';
import { AccessLevels } from './access-token.type';
import {
  AccessTokenDocument,
  AccessTokenModel,
} from './models/access-token.model';

class AccessTokenService {
  async createAccessToken(createAccessTokenDto) {
    const accessToken = new AccessTokenModel(createAccessTokenDto);
    return await accessToken.save();
  }

  async findAllAccessTokens({
    limit = 10,
    page = 1,
    bucketId,
    user,
  }): Promise<PaginationResult<AccessTokenDocument>> {
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
    const accessTokens = await AccessTokenModel.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit + 1)
      .lean()
      .exec();
    const accessTokenCount = await AccessTokenModel.countDocuments(
      query,
    ).exec();
    const hasNextPage = accessTokenCount > limit;
    return {
      result: accessTokens,
      meta: {
        pages: Math.ceil(accessTokenCount / limit),
        total: accessTokenCount,
        limit,
        page,
        hasNextPage,
        nextPage: hasNextPage ? page + 1 : null,
      },
    };
  }

  async getValidAccessToken({
    token,
    level,
  }: {
    token: string;
    level: AccessLevels;
  }) {
    const accessToken = await AccessTokenModel.findOne({
      token,
      accessLevel: level,
    });

    return accessToken;
  }

  async removeAccessTokens(ids: string[]) {
    return await AccessTokenModel.deleteMany({ _id: { $in: ids } });
  }
}

export default new AccessTokenService();
