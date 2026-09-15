import type { Book } from '../models/types.ts';
import { sanitizeText } from '../utils/sanitize.ts';

export type BookInput = Omit<Book, 'id'>;

const MAX_TITLE_LENGTH = 200;

type ValidationResult =
    | { ok: true; value: BookInput }
    | { ok: false; errors: string[] };

function isPositiveInteger(value: unknown): value is number {
    return Number.isInteger(value) && (value as number) > 0;
}

export function validateBookInput(body: unknown): ValidationResult {
    const input = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
    const errors: string[] = [];
    const currentYear = new Date().getFullYear();

    const title = typeof input.title === 'string' ? sanitizeText(input.title) : '';
    if (title === '') {
        errors.push('title is required and must be a non-empty string');
    } else if (title.length > MAX_TITLE_LENGTH) {
        errors.push(`title must be at most ${MAX_TITLE_LENGTH} characters`);
    }

    if (!isPositiveInteger(input.authorId)) {
        errors.push('authorId must be a positive integer');
    }

    if (!isPositiveInteger(input.genreId)) {
        errors.push('genreId must be a positive integer');
    }

    if (!Number.isInteger(input.year) || (input.year as number) > currentYear) {
        errors.push(`year must be a whole number no later than ${currentYear}`);
    }

    if (errors.length > 0) {
        return { ok: false, errors };
    }

    return {
        ok: true,
        value: {
            title,
            authorId: input.authorId as number,
            genreId: input.genreId as number,
            year: input.year as number,
        },
    };
}
