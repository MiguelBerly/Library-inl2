import type { Request, Response } from 'express';
import { listGenres, findGenreBySlug } from '../services/genreService.ts';
import { listBooks } from '../services/bookService.ts';

export async function getGenres(_req: Request, res: Response): Promise<void> {
    const genres = await listGenres();
    res.json({ data: genres });
}

type SlugParams = { slug: string };

export async function getGenreBooks(req: Request<SlugParams>, res: Response): Promise<void> {
    const genre = await findGenreBySlug(req.params.slug);

    if (!genre) {
        res.status(404).json({ error: `No genre called ${req.params.slug}` });
        return;
    }

    const books = await listBooks({ genre: genre.slug });
    res.json({ data: books });
}
