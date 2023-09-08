import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBucket extends Document {
  name: string;
  views: Array<{
    country: string;
    device: string;
    countryCode: string;
    isp: string;
    ip: string;
    platform: string;
  }>;
  whiteList: string[];
  description: string;
  responseStyle: 'default' | 'json' | 'params' | 'custom';
  structure: Array<{
    name: string;
    type: string;
    default: string;
    required: boolean;
  }>;
  customRedirect: string;
  accessToken: string;
  publicKey: string;
  owner: string;
  // owner: Types.ObjectId;
  createdAt: Date;
}

export const BucketSchema = new Schema<IBucket>({
  name: { type: String, required: true },
  views: [
    {
      country: String,
      device: String,
      countryCode: String,
      isp: String,
      ip: String,
      platform: String,
    },
  ],
  whiteList: { type: [String], default: [] },
  description: { type: String, default: '' },
  responseStyle: {
    type: String,
    enum: ['default', 'json', 'params', 'custom'],
    default: 'default',
  },
  structure: [
    {
      name: String,
      type: String,
      default: String,
      required: Boolean,
    },
  ],
  customRedirect: { type: String },
  accessToken: { type: String, default: '' },
  publicKey: { type: String, default: '' },
  owner: { type: String, required: true },
  // owner: { type: 'ObjectId', ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const BucketModel = mongoose.model<IBucket>('Bucket', BucketSchema);

export default BucketModel;
