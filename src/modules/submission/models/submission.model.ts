import mongoose, { Document, Schema, Model } from 'mongoose';

export interface SubmissionMeta {
  country: string;
  countryCode: string;
  isp: string;
  ip: string;
  device: string;
  platform: string;
}

export interface SubmissionDocument extends Document {
  submissionTime: Date;
  bucket: mongoose.Types.ObjectId;
  data: any;
  meta: SubmissionMeta;
}

export interface SubmissionModel extends Model<SubmissionDocument> {}

const SubmissionSchema = new Schema<SubmissionDocument, SubmissionModel>({
  submissionTime: { type: Date, default: Date.now },
  bucket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bucket',
    required: true,
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      country: '',
      device: '',
      countryCode: '',
      isp: '',
      ip: '',
      platform: '',
    },
  },
});

const SubmissionModel = mongoose.model<SubmissionDocument, SubmissionModel>(
  'Submission',
  SubmissionSchema,
);

export default SubmissionModel;
