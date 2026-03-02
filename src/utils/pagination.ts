export interface PaginationQuery {
    page?: number;
    limit?: number;
}

export interface PaginationOptions {
    page: number;
    limit: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
