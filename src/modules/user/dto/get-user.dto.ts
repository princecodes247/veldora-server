import { Types } from 'mongoose';

export interface GetUserDto {
  _id: Types.ObjectId;

  username: string;

  email: string;
  // Exclude the password field from serialization
  password: string;
}
