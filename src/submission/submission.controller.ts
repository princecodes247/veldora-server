import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  // @Get()
  // findAll(
  //   @Query('limit') limit: number = 10,
  //   @Query('cursor') cursor?: string,
  // ) {
  //   return this.submissionService.findAll(limit, cursor);
  // }

  @Get()
  async getSubmissionsByFormId(
    @Query('bucket') bucket: string,
    @Query('limit') limit: number = 10,
    @Query('cursor') cursor?: string,
  ): Promise<any> {
    // GUARD FOR USER
    return this.submissionService.findAll({
      limit,
      cursor,
      bucketId: bucket,
    });
  }
}
