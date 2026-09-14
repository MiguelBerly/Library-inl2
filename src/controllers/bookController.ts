import type { Request, Response } from 'express';
import { listBooks, findBookById } from '../services/bookService.ts';

export async function getBooks(_req: Request, res: Response): Promise<void> {
    const books = await listBooks();
    res.json({ data: books });
}

type IdParams = { id: string };

export async function getBookById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        res.status(400).json({ error: 'Id must be a positive integer' });
        return;
    }

    const book = await findBookById(id);

    if (!book) {
        res.status(404).json({ error: `No book with id ${id}` });
        return;
    }

    res.json({ data: book });
}
