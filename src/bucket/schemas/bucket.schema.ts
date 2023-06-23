import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BucketDocument = HydratedDocument<Bucket>;

@Schema()
export class Bucket {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: string;
}

export const BucketSchema = SchemaFactory.createForClass(Bucket);
