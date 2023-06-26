import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BucketDocument = HydratedDocument<Bucket>;

@Schema()
export class Bucket {
  @Prop({ required: true })
  name: string;

  @Prop({
    default: [],
    type: [
      {
        country: String,
        device: String,
        countryCode: String,
        isp: String,
        ip: String,
        platform: String,
      },
    ],
  })
  views: Array<{
    country: string;
    device: string;
    countryCode: string;
    isp: string;
    ip: string;
    platform: string;
  }>;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: string;
}

export const BucketSchema = SchemaFactory.createForClass(Bucket);
