import type { Request, Response } from 'express';
import { listBooks, findBookById, createBook, updateBook, removeBook } from '../services/bookService.ts';
import type { BookFilter } from '../services/bookService.ts';
import { validateBookInput } from '../validators/bookValidator.ts';
import { parseId, INVALID_ID_ERROR } from '../utils/parseId.ts';

type IdParams = { id: string };

export async function getBooks(req: Request, res: Response): Promise<void> {
    const { genre, author } = req.query;
    const filter: BookFilter = {};

    if (typeof genre === 'string') {
        filter.genre = genre;
    }

    if (author !== undefined) {
        const authorId = typeof author === 'string' ? parseId(author) : null;

        if (authorId === null) {
            res.status(400).json({ error: 'The author filter must be a positive integer' });
            return;
        }

        filter.authorId = authorId;
    }

    const books = await listBooks(filter);
    res.json({ data: books });
}

export async function getBookById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = parseId(req.params.id);

    if (id === null) {
        res.status(400).json(INVALID_ID_ERROR);
        return;
    }

    const book = await findBookById(id);

    if (!book) {
        res.status(404).json({ error: `No book with id ${id}` });
        return;
    }

    res.json({ data: book });
}

export async function postBook(req: Request, res: Response): Promise<void> {
    const validation = validateBookInput(req.body);

    if (!validation.ok) {
        res.status(400).json({ error: 'Invalid book', details: validation.errors });
        return;
    }

    const input = validation.value;
    const result = await createBook(input);

    switch (result.status) {
        case 'ok':
            res.status(201).json({ data: result.book });
            return;
        case 'author-not-found':
            res.status(400).json({ error: `No author with id ${input.authorId}` });
            return;
        case 'genre-not-found':
            res.status(400).json({ error: `No genre with id ${input.genreId}` });
            return;
    }
}

export async function putBook(req: Request<IdParams>, res: Response): Promise<void> {
    const id = parseId(req.params.id);

    if (id === null) {
        res.status(400).json(INVALID_ID_ERROR);
        return;
    }

    const validation = validateBookInput(req.body);

    if (!validation.ok) {
        res.status(400).json({ error: 'Invalid book', details: validation.errors });
        return;
    }

    const input = validation.value;
    const result = await updateBook(id, input);

    switch (result.status) {
        case 'ok':
            res.json({ data: result.book });
            return;
        case 'not-found':
            res.status(404).json({ error: `No book with id ${id}` });
            return;
        case 'author-not-found':
            res.status(400).json({ error: `No author with id ${input.authorId}` });
            return;
        case 'genre-not-found':
            res.status(400).json({ error: `No genre with id ${input.genreId}` });
            return;
    }
}

export async function deleteBook(req: Request<IdParams>, res: Response): Promise<void> {
    const id = parseId(req.params.id);

    if (id === null) {
        res.status(400).json(INVALID_ID_ERROR);
        return;
    }

    const removed = await removeBook(id);

    if (!removed) {
        res.status(404).json({ error: `No book with id ${id}` });
        return;
    }

    res.sendStatus(204);
}
