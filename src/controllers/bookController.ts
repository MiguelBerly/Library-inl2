import type { Request, Response } from 'express';
import { listBooks, findBookById, createBook, updateBook, removeBook } from '../services/bookService.ts';
import { validateBookInput } from '../validators/bookValidator.ts';

export async function getBooks(_req: Request, res: Response): Promise<void> {
    const books = await listBooks();
    res.json({ data: books });
}

type IdParams = { id: string };

const INVALID_ID_ERROR = { error: 'Id must be a positive integer' };

function parseId(value: string): number | null {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
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
