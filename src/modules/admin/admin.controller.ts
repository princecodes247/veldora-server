import { Request, Response } from 'express';
import AdminService from './admin.service';
import { sendResponse } from '../../utils/send-response.util';
import { StatusCodes } from 'http-status-codes';

class AdminController {
  async getStats(req: Request, res: Response) {
    try {
      const data = await AdminService.getStats();
      return sendResponse({
        res,
        message: 'Stats Retrived',
        success: true,
        data,
        status: StatusCodes.OK,
      });
    } catch (error) {
      console.log({ error });
      return sendResponse({
        res,
        message: 'Could not fetch stats',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error?.message ?? '',
      });
    }
  }
}

export default new AdminController();
