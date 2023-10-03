import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { sendResponse } from '../utils/send-response.util';

const validateRequest =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        file: req?.file,
        files: req?.files,
      });
      next();
    } catch (e: any) {
      return sendResponse({
        res,
        status: 400,
        success: false,
        message: e?.errors[0].message,
        error: e?.errors,
      });
    }
  };

export default validateRequest;
