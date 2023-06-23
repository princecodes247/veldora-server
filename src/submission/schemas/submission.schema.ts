import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type SubmissionDocument = HydratedDocument<Submission>;

@Schema()
export class Submission {
  @Prop({ type: Date, default: Date.now })
  submissionTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'Bucket', required: true })
  bucket: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  data: any;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
