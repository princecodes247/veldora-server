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

class ForgotPasswordController {
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

      let { token } = await OTPTokenService.generateUUID(
        user._id,
        'passwordReset',
        email,
      );
      console.log({ token });

      AuthService.sendPasswordResetService(email, token);
      // return OTP;
      sendResponse({
        res,
        status: StatusCodes.OK,
        message: 'Password reset link sent successfully',
        success: true,
      });
    } catch (error) {
      console.error(error);
      sendResponse({
        res,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to send Password reset link',
        success: false,
      });
    }
  }

  async resendPasswordReset(req: Request, res: Response) {
    const { email } = req.body;

    try {
      // Check for existing code
      const existingCode = await OTPTokenService.getOTPByMeta(
        email,
        'passwordReset',
      );
      let token = '';
      if (existingCode) {
        token = existingCode.token;
      } else {
        const user = await UserService.findOneByEmail(email);
        if (!user) {
          return sendResponse({
            res,
            status: StatusCodes.NOT_FOUND,
            message: 'No such user',
            success: false,
          });
        }
        const newOTP = await OTPTokenService.generateUUID(
          user._id,
          'passwordReset',
          email,
        );
        if (newOTP) {
          token = newOTP.token;
        }
      }
      // const [user, ]
      console.log({ token });

      AuthService.sendPasswordResetService(email, token);
      // return OTP;
      sendResponse({
        res,
        status: StatusCodes.OK,
        message: 'Password reset link sent successfully',
        success: true,
      });
    } catch (error) {
      console.error(error);
      sendResponse({
        res,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to send Password reset link',
        success: false,
      });
    }
  }
  async verifyPasswordReset(req: Request, res: Response) {
    try {
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
    } catch (error) {
      sendResponse({
        res,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Could not complete request',
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
}

export default new ForgotPasswordController();
