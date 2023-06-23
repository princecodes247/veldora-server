import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  following: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Group' }] })
  groups: string[]; // Array of group IDs that the user is a member of
}

export const UserSchema = SchemaFactory.createForClass(User);
