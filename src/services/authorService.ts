import { readDb } from '../db/storage.ts';
import type { Author } from '../models/types.ts';

export async function listAuthors(): Promise<Author[]> {
    const db = await readDb();
    return db.authors;
}

export async function findAuthorById(id: number): Promise<Author | undefined> {
    const db = await readDb();
    return db.authors.find((author) => author.id === id);
}
