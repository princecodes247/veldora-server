import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BucketService } from './bucket.service';
import { BucketController } from './bucket.controller';
import { Bucket, BucketSchema } from './schemas/bucket.schema';
import { SubmissionModule } from 'src/submission/submission.module';

@Module({
  imports: [
    SubmissionModule,
    MongooseModule.forFeature([{ name: Bucket.name, schema: BucketSchema }]),
  ],
  controllers: [BucketController],
  providers: [BucketService],
  exports: [BucketService],
})
export class BucketModule {}
