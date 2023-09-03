import { PartialType } from '@nestjs/mapped-types';
import { CreateSubmissionDto } from './submission.dto';

export class UpdateSubmissionDto extends PartialType(CreateSubmissionDto) {}
