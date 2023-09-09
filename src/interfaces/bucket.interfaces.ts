export interface Bucket {
  id: string;
  name: string;
  // Other properties...
}

export class PaginationCursorDto {
  cursor?: string;
  limit?: number;
}

export class PaginationDto {
  page?: number;
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
  result: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  nextPage: number;
}
