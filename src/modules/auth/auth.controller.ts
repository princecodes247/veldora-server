// auth.controller.ts
import { Request, Response } from 'express';
import AuthService from './auth.service';
import { SigninRequestDto, SigninResponseDto } from './dto/signin.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { sendResponse } from '../../utils/send-response.util';
import { StatusCodes } from 'http-status-codes';
import { COOKIE_TOKEN } from './auth.constant';
import { UserService } from '../user';
import { OTPTokenService } from '../otpToken';

class AuthController {
  async signIn(req: Request, res: Response) {
    try {
      const signInDto: SigninRequestDto = req.body;
      const user = await AuthService.signIn(
        signInDto.email,
        signInDto.password,
      );
      if (!user) {
        sendResponse({
          res,
          message: 'Unauthorized: Invalid username or password',
          success: false,
          status: StatusCodes.UNAUTHORIZED,
        });
        return;
      }

      // Set the token as an HttpOnly cookie
      res.cookie(COOKIE_TOKEN, user.access_token, {
        httpOnly: true,
        secure: true, // Use 'true' in production with HTTPS
        sameSite: 'lax', // Adjust as needed for your application
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        // other cookie options (e.g., 'maxAge', 'path', 'domain', etc.)
      });
      req.session.isAuthenticated = true;
      req.session.user = user;

      sendResponse({
        res,
        message: 'User signed in!',
        success: true,
        status: StatusCodes.OK,
        data: user,
      });
    } catch (error) {
      sendResponse({
        res,
        message: 'Internal server error',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async signUp(req: Request, res: Response) {
    try {
      const signUpDto: CreateUserDto = req.body;
      const user = await AuthService.signUp(signUpDto);
      sendResponse({
        res,
        message: 'User signed up!',
        success: true,
        status: StatusCodes.CREATED,
        data: user,
      });
    } catch (error) {
      sendResponse({
        res,
        message: error?.message ?? 'Internal server error',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async verifyAuth(req: Request, res: Response) {
    try {
      const user = await AuthService.verifyAuth(req);
      sendResponse({
        res,
        message: 'User verified!',
        success: true,
        status: StatusCodes.OK,
        data: user,
      });
    } catch (error) {
      sendResponse({
        res,
        message: 'Internal server error',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async resendOTP(req: Request, res: Response) {
    const { email } = req.body;

    let OTP = AuthService.generateOTPService();
    try {
      AuthService.sendOTPService(email, OTP);

      console.log(OTP);
      // return OTP;

      sendResponse({
        res,
        status: StatusCodes.OK,
        message: 'OTP sent successfully',
        success: true,
      });
    } catch (error) {
      console.error(error);

      sendResponse({
        res,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to send OTP code',
        success: false,
      });
    }
  }

  async sendEmailOTP(req: Request, res: Response) {
    const { email } = req.body;

    try {
      const user = await UserService.findOneByEmail(email);
      if (!user) {
        return sendResponse({
          res,
          status: StatusCodes.NOT_FOUND,
          message: 'User not found',
          success: false,
        });
      }

      let OTP = await OTPTokenService.generateOTP(
        user._id,
        'emailVerification',
      );
      console.log({ OTP });

      AuthService.sendOTPService(email, OTP);
      // return OTP;
      sendResponse({
        res,
        status: StatusCodes.OK,
        message: 'OTP sent successfully',
        success: true,
      });
    } catch (error) {
      console.error(error);
      sendResponse({
        res,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to send OTP code',
        success: false,
      });
    }
  }

  async verifyEmailOTP(
    req: Request & {
      userId: string;
    },
    res: Response,
  ) {
    const { token, email } = req.body;

    const user = await UserService.findOneByEmail(email);

    if (!user) {
      return sendResponse({
        res,
        status: StatusCodes.NOT_FOUND,
        message: 'User does not exist',
        success: false,
      });
    }

    const isVerifiedUser = await AuthService.verifyUserEmail(user._id, token);
    if (isVerifiedUser) {
      // Update user's email verification status
      console.log('Email verified successfully');
      sendResponse({
        res,
        status: StatusCodes.OK,
        message: 'Email verified successfully',
        success: true,
        data: isVerifiedUser,
      });
    } else {
      console.log('Invalid or expired token');
      sendResponse({
        res,
        status: StatusCodes.BAD_REQUEST,
        message: 'Invalid or expired token',
        success: false,
      });
    }
  }

  async requestPasswordReset(req: Request, res: Response) {
    const { email } = req.body;

    try {
      const user = await UserService.findOneByEmail(email);
      if (!user) {
        return sendResponse({
          res,
          status: StatusCodes.NOT_FOUND,
          message: 'User not found',
          success: false,
        });
      }

      let OTP = await OTPTokenService.generateOTP(user._id, 'passwordReset');
      console.log({ OTP });

      AuthService.sendOTPService(email, OTP);
      // return OTP;
      sendResponse({
        res,
        status: StatusCodes.OK,
        message: 'OTP sent successfully',
        success: true,
      });
    } catch (error) {
      console.error(error);
      sendResponse({
        res,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to send OTP code',
        success: false,
      });
    }
  }
  async verifyPasswordReset(req: Request, res: Response) {
    const { otp } = req.body;

    const isVerified = await AuthService.verifyPasswordReset(otp);
    if (isVerified) {
      console.log('OTP verified successfully');
      sendResponse({
        res,
        status: StatusCodes.OK,
        message: 'OTP verified successfully',
        success: true,
      });
    } else {
      console.log('Invalid or expired token');
      sendResponse({
        res,
        status: StatusCodes.BAD_REQUEST,
        message: 'Invalid or expired token',
        success: false,
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { password: newPassword, otp } = req.body;
    try {
      const otpToken = await AuthService.verifyPasswordReset(otp);
      console.log({ otpToken });
      if (!otpToken) {
        return sendResponse({
          res,
          status: StatusCodes.BAD_REQUEST,
          message: 'Invalid or expired token',
          success: false,
        });
      }

      const user = UserService.changePassword(otpToken.userId, newPassword);
      if (!user) {
        // return res
        //   .status(404)
        //   .send({ error: "No user registered with that email or phone number" });
        return sendResponse({
          res,
          status: StatusCodes.NOT_FOUND,
          message: 'No such registered user',
          success: false,
        });
      }

      // Delete the otpToken
      await OTPTokenService.deleteOTP(otpToken.token, 'passwordReset');

      sendResponse({
        res,
        status: StatusCodes.OK,
        message: 'Password reset successfully',
        success: true,
        data: user,
      });
    } catch (error) {
      console.error(error);

      sendResponse({
        res,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An error occurred while resetting password',
        success: false,
      });
    }
  }
  logout(req: Request, res: Response) {
    // Clear the session token cookie to log the user out
    res.clearCookie(COOKIE_TOKEN);
    sendResponse({
      res,
      message: 'Logout successful',
      success: true,
      status: StatusCodes.OK,
    });
  }
}

export default new AuthController();
