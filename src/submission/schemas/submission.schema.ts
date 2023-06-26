import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type SubmissionDocument = HydratedDocument<Submission>;

@Schema()
export class Submission {
  @Prop({ type: Date, default: Date.now })
  submissionTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'Bucket', required: true })
  bucket: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  data: any;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {
    country: "",
    device: ""
  } })
  meta: {
    country: String,
    device: String
  }
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
