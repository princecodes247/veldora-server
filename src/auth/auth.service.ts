import { CreateUserDto } from './../user/dto/create-user.dto';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../user/schemas/user.schema';
import { PassageService } from 'src/passage/passage.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private passageService: PassageService,
  ) {}

  generateToken(user: UserDocument) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username);
    console.log({ user });
    if (!user) {
      return null;
    }
    const match = await bcrypt.compare(pass, user.password);
    if (!match) {
      return null;
    }
    const result = user.toObject();

    return {
      ...result,
      ...this.generateToken(user),
    };
  }
  async signUp(signUpDTO: CreateUserDto) {
    // Check if user exists by email and username
    const isTaken = await this.userService.isEmailOrUsernameTaken(
      signUpDTO.email,
      signUpDTO.username,
    );
    if (isTaken) {
      throw new Error(isTaken);
    }
    const user = await this.userService.create(signUpDTO);
    const { password: pass, ...result } = user.toObject();

    return { ...result, ...this.generateToken(user) };
  }

  async verifyAuth(req) {
    try {
      const userID = await this.passageService.authenticateRequest(req);
      if (userID) {
        // user is authenticated
        const { email, phone } = await this.passageService.get(userID);
        const identifier = email ? email : phone;

        return identifier;
      }
    } catch (e) {
      // authentication failed
      console.log(e);
    }
  }
}
