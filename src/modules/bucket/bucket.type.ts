import { Request } from 'express';
import { IBucket } from './models/bucket.model';

export interface RequestWithBucket extends Request {
  bucket: IBucket;
}

export enum SubmissionType {
  TEXT = 'text',
  EMAIL = 'email',
  URL = 'url',
  PHONE = 'phone',
  BOOLEAN = 'boolean',
}
