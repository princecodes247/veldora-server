import { IsOptional, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationCursorDto {
  @IsOptional()
  cursor?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  limit?: number;
}

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  page?: number;
  
  @IsOptional()
  @Transform(({ value }) => parseInt(value))  
  @IsPositive()
  limit?: number;
}

export interface PaginationCursorResult<T> {
  data: T[];
  total: number;
  page?: number;
  cursor?: string;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}
