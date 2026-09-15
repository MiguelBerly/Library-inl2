import type { Request, Response } from 'express';
import { listAuthors, findAuthorById } from '../services/authorService.ts';
import { listBooks } from '../services/bookService.ts';
import { parseId, INVALID_ID_ERROR } from '../utils/parseId.ts';

export async function getAuthors(_req: Request, res: Response): Promise<void> {
    const authors = await listAuthors();
    res.json({ data: authors });
}

type IdParams = { id: string };

export async function getAuthorBooks(req: Request<IdParams>, res: Response): Promise<void> {
    const id = parseId(req.params.id);

    if (id === null) {
        res.status(400).json(INVALID_ID_ERROR);
        return;
    }

    const author = await findAuthorById(id);

    if (!author) {
        res.status(404).json({ error: `No author with id ${id}` });
        return;
    }

    const books = await listBooks({ authorId: author.id });
    res.json({ data: books });
}
