import { Request, Response } from 'express';
import UserService from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination.dto';
import { RequestWithAuth } from '../auth';
import { sendResponse } from '../../utils/send-response.util';
import { StatusCodes } from 'http-status-codes';

class UserController {
  async create(req: Request, res: Response) {
    try {
      const createUserDto: CreateUserDto = req.body;
      const user = await UserService.create(createUserDto);

      sendResponse({
        res,
        message: 'New User Created',
        success: true,
        data: user,
        status: StatusCodes.CREATED,
      });
    } catch (error) {
      sendResponse({
        res,
        message: 'Internal Server Error',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error?.message ?? '',
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      console.log({ req, headusers: req.headers });
      const pagination: PaginationDto = req.query;
      const users = await UserService.findAll(pagination);
      sendResponse({
        res,
        message: 'Users Found',
        success: true,
        data: users,
        status: StatusCodes.OK,
      });
    } catch (error) {
      sendResponse({
        res,
        message: 'Internal Server Error',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error?.message ?? '',
      });
    }
  }

  async findUserProfile(req: RequestWithAuth, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        sendResponse({
          res,
          message: 'User not found',
          success: false,
          status: StatusCodes.NOT_FOUND,
        });
        return;
      }
      sendResponse({
        res,
        message: 'User Found',
        success: true,
        data: user,
        status: StatusCodes.OK,
      });
    } catch (error) {
      sendResponse({
        res,
        message: 'Internal Server Error',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error?.message ?? '',
      });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      const user = await UserService.findOne(id);
      if (!user) {
        sendResponse({
          res,
          message: 'User not found',
          success: false,
          status: StatusCodes.NOT_FOUND,
        });
        return;
      }
      sendResponse({
        res,
        message: 'User Found',
        success: true,
        data: user,
        status: StatusCodes.OK,
      });
    } catch (error) {
      sendResponse({
        res,
        message: 'Internal Server Error',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error?.message ?? '',
      });
    }
  }

  async update(req: RequestWithAuth, res: Response) {
    try {
      const updateUserDto: UpdateUserDto = req.body;

      const user = await UserService.update(req.user.userID, updateUserDto);
      if (!user) {
        sendResponse({
          res,
          message: 'User not found',
          success: false,
          status: StatusCodes.NOT_FOUND,
        });
        return;
      }
      sendResponse({
        res,
        message: 'User Updated',
        success: true,
        data: user,
        status: StatusCodes.OK,
      });
    } catch (error) {
      sendResponse({
        res,
        message: 'Internal Server Error',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error?.message ?? '',
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      await UserService.remove(id);
      res.status(204).send();
    } catch (error) {
      sendResponse({
        res,
        message: 'Internal Server Error',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error?.message ?? '',
      });
    }
  }
}

export default new UserController();
