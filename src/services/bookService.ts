import { readDb } from '../db/storage.ts';
import type { Book } from '../models/types.ts';

export async function listBooks(): Promise<Book[]> {
    const db = await readDb();
    return db.books;
}

export async function findBookById(id: number): Promise<Book | undefined> {
    const db = await readDb();
    return db.books.find((book) => book.id === id);
}
