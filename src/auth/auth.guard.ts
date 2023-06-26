import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './auth.constant';
import { Request } from 'express';
import { PassageService } from 'src/passage/passage.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private passageService: PassageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      console.log({ token });
      const userID = await this.passageService.authenticate(token);
      console.log({ userID });
      if (!userID) {
        throw new UnauthorizedException();
      }
      // user is authenticated
      const { email, phone } = await this.passageService.get(userID);
      const identifier = email ? email : phone;
      request['user'] = { userID, email, phone };
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    console.log({ type, token });
    return type === 'Bearer' ? token : undefined;
  }
}
