import type { Request, Response } from 'express';
import { listGenres, findGenreBySlug } from '../services/genreService.ts';
import { listBooks } from '../services/bookService.ts';
import { parsePagination, paginate } from '../utils/pagination.ts';
import { sanitizeText } from '../utils/sanitize.ts';

export async function getGenres(_req: Request, res: Response): Promise<void> {
    const genres = await listGenres();
    res.json({ data: genres });
}

type SlugParams = { slug: string };

export async function getGenreBooks(req: Request<SlugParams>, res: Response): Promise<void> {
    const pagination = parsePagination(req.query);

    if (!pagination.ok) {
        res.status(400).json({ error: pagination.error });
        return;
    }

    const genre = await findGenreBySlug(req.params.slug);

    if (!genre) {
        res.status(404).json({ error: `No genre called ${sanitizeText(req.params.slug)}` });
        return;
    }

    const books = await listBooks({ genre: genre.slug });
    res.json(paginate(books, pagination.value));
}
