import { readDb, writeDb } from '../db/storage.ts';
import type { Book } from '../models/types.ts';
import type { BookInput } from '../validators/bookValidator.ts';

export async function listBooks(): Promise<Book[]> {
    const db = await readDb();
    return db.books;
}

export async function findBookById(id: number): Promise<Book | undefined> {
    const db = await readDb();
    return db.books.find((book) => book.id === id);
}

type CreateBookResult =
    | { status: 'ok'; book: Book }
    | { status: 'author-not-found' }
    | { status: 'genre-not-found' };

export async function createBook(input: BookInput): Promise<CreateBookResult> {
    const db = await readDb();

    if (!db.authors.some((author) => author.id === input.authorId)) {
        return { status: 'author-not-found' };
    }

    if (!db.genres.some((genre) => genre.id === input.genreId)) {
        return { status: 'genre-not-found' };
    }

    const id = Math.max(0, ...db.books.map((book) => book.id)) + 1;
    const book: Book = { id, ...input };

    db.books.push(book);
    await writeDb(db);

    return { status: 'ok', book };
}

type UpdateBookResult = CreateBookResult | { status: 'not-found' };

export async function updateBook(id: number, input: BookInput): Promise<UpdateBookResult> {
    const db = await readDb();
    const index = db.books.findIndex((book) => book.id === id);

    if (index === -1) {
        return { status: 'not-found' };
    }

    if (!db.authors.some((author) => author.id === input.authorId)) {
        return { status: 'author-not-found' };
    }

    if (!db.genres.some((genre) => genre.id === input.genreId)) {
        return { status: 'genre-not-found' };
    }

    const book: Book = { id, ...input };

    db.books[index] = book;
    await writeDb(db);

    return { status: 'ok', book };
}

export async function removeBook(id: number): Promise<boolean> {
    const db = await readDb();
    const index = db.books.findIndex((book) => book.id === id);

    if (index === -1) {
        return false;
    }

    db.books.splice(index, 1);
    await writeDb(db);

    return true;
}
