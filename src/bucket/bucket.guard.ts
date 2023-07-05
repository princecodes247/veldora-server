import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { BucketService } from './bucket.service';

@Injectable()
export class BucketGuard implements CanActivate {
  constructor(private bucketService: BucketService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.bucketService.findByAccessToken(token);
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      if (!payload) {
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
