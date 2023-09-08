import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

interface ApiResponse<T, U> {
  success: boolean;
  message: string;
  data?: T;
  error?: U extends false ? Error : null;
}

export function sendResponse<T, U extends boolean>({
  res,
  status,
  message = 'Success',
  data,
  success,
  error,
}: {
  res: Response;
  status?: StatusCodes;
  message: string;
  data?: U extends true ? T : null;
  success: U;
  error?: U extends false ? Error : null;
}): void {
  const responseBody: ApiResponse<U extends true ? T : null, U> = {
    success,
    message,
    data,
    error,
  };

  res
    .status(status ?? (success ? StatusCodes.OK : StatusCodes.BAD_REQUEST))
    .json(responseBody);
}
