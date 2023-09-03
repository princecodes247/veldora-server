import { Request } from 'express';
import { IBucket } from './models/bucket.model';

export interface RequestWithBucket extends Request {
  bucket: IBucket;
}
