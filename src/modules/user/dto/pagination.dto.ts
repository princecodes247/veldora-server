export interface PaginationCursorDto {
  cursor?: string;

  limit?: number;
}

export interface PaginationDto {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page?: number;
  cursor?: string;
  limit: number;
}
