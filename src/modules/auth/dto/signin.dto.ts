import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
export class SigninRequestDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

export class SigninResponseDto {
  @Expose()
  _id: Types.ObjectId;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  access_token: string;
}
