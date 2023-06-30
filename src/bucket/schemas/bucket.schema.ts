import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BucketDocument = HydratedDocument<Bucket>;

@Schema()
export class Bucket {
  @Prop({ type: String, required: true })
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

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({
    type: String,
    enum: ['default', 'json', 'params', 'custom'],
    default: 'default',
  })
  responseStyle: string;

  @Prop({ type: String })
  customRedirect: string;

  @Prop({ type: String, default: '' })
  accessToken: string;

  @Prop({ type: String, default: '' })
  publicKey: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const BucketSchema = SchemaFactory.createForClass(Bucket);
