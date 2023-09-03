// auth.controller.ts
import { Request, Response } from 'express';
import AuthService from './auth.service';
import { SigninRequestDto, SigninResponseDto } from './dto/signin.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { sendResponse } from '../../utils/send-response.util';
import { StatusCodes } from 'http-status-codes';

class AuthController {
  async signIn(req: Request, res: Response) {
    try {
      const signInDto: SigninRequestDto = req.body;
      const user: SigninResponseDto = await AuthService.signIn(
        signInDto.username,
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
}

export default new AuthController();
