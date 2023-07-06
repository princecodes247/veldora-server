import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto, DeleteSubmissionDTO } from './dto/submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserBucketGuard } from 'src/bucket/user-bucket.guard';

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
  @UseGuards(AuthGuard)
  async getSubmissionsByFormId(
    @Request() req,
    @Query('bucket') bucket: string,
    @Query('limit') limit: number = 10,
    @Query('page') page?: number,
  ): Promise<any> {
    // GUARD FOR USER
    return this.submissionService.findAll({
      limit,
      page,
      bucketId: bucket,
      user: req.user.userID,
    });
  }

  @Post('delete')
  // @UseGuards(AuthGuard)
  // ADD UserBucketGuard
  async deleteSubmission(
    @Body() deleteSubmissionDTO: DeleteSubmissionDTO,
  ): Promise<any> {
    return this.submissionService.remove(deleteSubmissionDTO.ids);
  }
}
