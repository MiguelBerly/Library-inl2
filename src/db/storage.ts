import { readFile, writeFile } from 'node:fs/promises';
import type { Database } from '../models/types.ts';

export class DatabaseError extends Error {
    override name = 'DatabaseError';
}

function dbPath(): string {
    return process.env.DB_PATH ?? 'data/db.json';
}

function isDatabase(value: unknown): value is Database {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const db = value as Record<string, unknown>;
    return Array.isArray(db.books) && Array.isArray(db.authors) && Array.isArray(db.genres);
}

export async function readDb(): Promise<Database> {
    let raw: string;

    try {
        raw = await readFile(dbPath(), 'utf-8');
    } catch (err) {
        throw new DatabaseError('Could not read the database file', { cause: err });
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch (err) {
        throw new DatabaseError('The database file is not valid JSON', { cause: err });
    }

    if (!isDatabase(parsed)) {
        throw new DatabaseError('The database file does not contain books, authors and genres lists');
    }

    return parsed;
}

export async function writeDb(db: Database): Promise<void> {
    try {
        await writeFile(dbPath(), JSON.stringify(db, null, 2));
    } catch (err) {
        throw new DatabaseError('Could not write the database file', { cause: err });
    }
}
