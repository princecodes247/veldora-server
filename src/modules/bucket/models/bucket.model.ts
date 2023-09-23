import mongoose, { Document, Schema, Types } from 'mongoose';
import slug from 'mongoose-slug-generator';
import generateSlug from '../../../utils/generate-slug.util';
import { SubmissionType } from '../bucket.type';

mongoose.plugin(slug);
export interface IBucket extends Document {
  name: string;
  slug: string;
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
    type?: SubmissionType;
    default?: string;
    unique?: boolean;
    required?: boolean;
  }>;
  customRedirect: string;
  accessToken: string;
  publicKey: string;
  owner: string;
  // owner: Types.ObjectId;
  createdAt: Date;
}

export const BucketStructureItemSchema = new Schema({
  name: String,
  type: {
    type: String,
    enum: Object.values(SubmissionType),
    default: SubmissionType.TEXT,
  },
  default: String,
  required: Boolean,
  unique: Boolean,
});

export const BucketSchema = new Schema<IBucket>({
  name: { type: String, required: true },
  slug: { type: String, slug: ['title', 'subtitle'], unique: true },
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
  structure: [BucketStructureItemSchema],
  customRedirect: { type: String },
  accessToken: { type: String, default: '' },
  publicKey: { type: String, default: '' },
  owner: { type: String, required: true },
  // owner: { type: 'ObjectId', ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

BucketSchema.pre('save', async function (next) {
  const doc = this;

  // Convert the name field to a slug
  const slug = doc.name.trim().toLowerCase().replace(/\s+/g, '-');

  // Check if the slug is already taken
  const existingDoc = await mongoose.model('Bucket').findOne({ slug });

  // If the slug is already taken, append a unique ID using shortid
  if (existingDoc) {
    const uniqueId = await generateSlug();
    console.log({ uniqueId });
    doc.slug = `${slug}-${uniqueId}`;
  } else {
    doc.slug = slug;
  }
  doc.name = doc.name.trim();
  doc.description = doc.description.trim();

  next();
});

const BucketModel = mongoose.model<IBucket>('Bucket', BucketSchema);

export default BucketModel;
