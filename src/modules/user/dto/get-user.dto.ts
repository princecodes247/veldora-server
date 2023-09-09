import { Exclude, Expose } from 'class-transformer';
import { Types } from 'mongoose';

export class GetUserDto {
  @Expose()
  _id: Types.ObjectId;

  @Expose()
  username: string;

  @Expose()
  email: string;
  // Exclude the password field from serialization
  @Exclude()
  password: string;
}
