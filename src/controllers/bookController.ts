import type { Request, Response } from 'express';
import { listBooks } from '../services/bookService.ts';

export async function getBooks(_req: Request, res: Response): Promise<void> {
    const books = await listBooks();
    res.json({ data: books });
}
