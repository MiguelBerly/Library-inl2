import { readDb } from '../db/storage.ts';
import type { Book } from '../models/types.ts';

export async function listBooks(): Promise<Book[]> {
    const db = await readDb();
    return db.books;
}
