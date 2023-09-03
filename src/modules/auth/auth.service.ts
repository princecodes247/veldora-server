import { CreateUserDto } from './../user/dto/create-user.dto';
import UserService from '../user/user.service';
import * as bcrypt from 'bcrypt';

import { IUser } from '../user/models/user.model';
import PassageAuth from '../../utils/passage-auth.utils';
import JWT from '../../utils/jwt.utils';

class AuthService {
  constructor(private passageAuth: PassageAuth) {}

  generateToken(user: IUser) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: JWT.sign(payload),
    };
  }

  async signIn(username: string, pass: string): Promise<any> {
    const user = await UserService.findOneByUsername(username);
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
    const isTaken = await UserService.isEmailOrUsernameTaken(
      signUpDTO.email,
      signUpDTO.username,
    );
    if (isTaken) {
      throw new Error(isTaken);
    }
    const user = await UserService.create(signUpDTO);
    const { password: pass, ...result } = user.toObject();

    return { ...result, ...this.generateToken(user) };
  }

  async verifyAuth(req) {
    try {
      const userID = await this.passageAuth.authenticateRequest(req);
      if (userID) {
        // user is authenticated
        const { email, phone } = await this.passageAuth.getUser(userID);
        const identifier = email ? email : phone;

        return identifier;
      }
    } catch (e) {
      // authentication failed
      console.log(e);
    }
  }
}

export default new AuthService(new PassageAuth());
