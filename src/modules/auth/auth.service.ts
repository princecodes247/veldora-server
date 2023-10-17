import { CreateUserDto } from './../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

import { UserModel, BaseUser, IUser, UserService } from '../user';
import PassageAuth from '../../utils/passage-auth.util';
import JWT from '../../utils/jwt.util';
import { OTPToken, OTPTokenService } from '../otpToken';
import { sendEmail } from '../../utils/mailer';
import {
  EMAIL_VERIFICATION_URL,
  FORGOT_PASSWORD_URL,
} from '../../config/env.config';

class AuthService {
  constructor(private passageAuth: PassageAuth) {}

  generateToken(user: IUser) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: JWT.sign(payload),
    };
  }

  async signIn(email: string, pass: string) {
    const user = await UserService.findOneByEmail(email);
    console.log({ user });
    if (!user) {
      return null;
    }
    const match = await bcrypt.compare(pass, user.password);
    if (!match) {
      return null;
    }
    const result = user.toObject<BaseUser>();

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
    const user = await UserService.create({ ...signUpDTO, username: '' });
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

  generateOTPService() {
    const code = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10),
    ).join('');
    return code;
  }

  async sendOTPService(email: string, OTP: string) {
    const msg = {
      to: email,
      from: 'spark@veldora.io',
      subject: 'Verify your email',
      text: `Your OTP code is ${OTP}`,
    };

    try {
      await sendEmail(msg);
      console.log(`OTP sent to ${email}`);
    } catch (error) {
      console.error(error + 'Error!');
      // throw new Error("Failed to send OTP code");
    }
  }

  async sendEmailVerificationService(email: string, OTP: string) {
    const msg = {
      to: email,
      from: 'spark@veldora.io',
      subject: 'Verify your email',
      text: `Click this link to verify your veldora account ${EMAIL_VERIFICATION_URL}/${OTP}`,
    };

    try {
      await sendEmail(msg);
      console.log(`OTP sent to ${email}`);
    } catch (error) {
      console.error(error + 'Error!');
      // throw new Error("Failed to send OTP code");
    }
  }

  async sendPasswordResetService(email: string, OTP: string) {
    const msg = {
      to: email,
      from: 'spark@veldora.io',
      subject: 'Reset your password',
      text: `Click this link to reset your password ${FORGOT_PASSWORD_URL}/${OTP}`,
    };

    try {
      await sendEmail(msg);
      console.log(`OTP sent to ${email}`);
    } catch (error) {
      console.error(error + 'Error!');
      // throw new Error("Failed to send OTP code");
    }
  }

  async verifyUserEmail(token: string): Promise<IUser | false> {
    console.log('verifyUserEmail', token);
    const otp = await OTPTokenService.getOTP(token, 'emailVerification');

    if (!otp) {
      return false;
    }
    const updatedUser = await UserModel.findByIdAndUpdate(
      otp.userId,
      { email_verified: true },
      { new: true },
    );

    return updatedUser;
  }

  verifyPasswordReset(token: string) {
    return OTPTokenService.getOTP(token, 'passwordReset');
  }
}

export default new AuthService(new PassageAuth());
