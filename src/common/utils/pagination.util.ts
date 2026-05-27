import { PaginatedResponse } from '../interfaces/paginated-response.interface';

export class PaginationUtil {
  static calculatePagination(
    total: number,
    page: number,
    limit: number,
  ): Omit<PaginatedResponse<any>['meta'], 'never'> {
    const totalPages = Math.ceil(total / limit);
    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  static createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponse<T> {
    return {
      data,
      meta: this.calculatePagination(total, page, limit),
    };
  }
}