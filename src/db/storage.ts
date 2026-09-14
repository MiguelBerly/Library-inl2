import { readFile } from 'node:fs/promises';
import type { Database } from '../models/types.ts';

function dbPath(): string {
    return process.env.DB_PATH ?? 'data/db.json';
}

export async function readDb(): Promise<Database> {
    const raw = await readFile(dbPath(), 'utf-8');
    return JSON.parse(raw) as Database;
}
