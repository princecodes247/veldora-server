import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { BucketService } from './bucket.service';

@Injectable()
export class UserBucketGuard implements CanActivate {
  constructor(private bucketService: BucketService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const payload = await this.bucketService.findOne(request.params.id);

      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      if (!payload || payload.owner !== request.user._id.toString()) {
        throw new UnauthorizedException();
      }
      request['bucket'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
