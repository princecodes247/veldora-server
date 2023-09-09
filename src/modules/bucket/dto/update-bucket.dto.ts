import { CreateBucketDto } from './create-bucket.dto';

export interface UpdateBucketDto
  extends Partial<Omit<CreateBucketDto, 'owner'>> {
  responseStyle?: 'default' | 'json' | 'params' | 'custom';
  customRedirect?: string;
}
