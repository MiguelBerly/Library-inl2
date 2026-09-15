import { parseId } from './parseId.ts';

export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

export type PageRequest = { page: number; limit: number };

export type Page<T> = {
    data: T[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
};

type ParsePaginationResult = { ok: true; value: PageRequest } | { ok: false; error: string };

function parsePositiveInteger(value: unknown, fallback: number): number | null {
    if (value === undefined) {
        return fallback;
    }

    return typeof value === 'string' ? parseId(value) : null;
}

export function parsePagination(query: Record<string, unknown>): ParsePaginationResult {
    const page = parsePositiveInteger(query.page, 1);
    const limit = parsePositiveInteger(query.limit, DEFAULT_LIMIT);

    if (page === null) {
        return { ok: false, error: 'page must be a positive integer' };
    }

    if (limit === null || limit > MAX_LIMIT) {
        return { ok: false, error: `limit must be a whole number between 1 and ${MAX_LIMIT}` };
    }

    return { ok: true, value: { page, limit } };
}

export function paginate<T>(items: T[], { page, limit }: PageRequest): Page<T> {
    const start = (page - 1) * limit;

    return {
        data: items.slice(start, start + limit),
        pagination: {
            page,
            limit,
            total: items.length,
            totalPages: Math.ceil(items.length / limit),
        },
    };
}
