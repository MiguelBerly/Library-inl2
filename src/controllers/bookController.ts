import type { Request, Response } from 'express';

export function getBooks(_req: Request, res: Response): void {
    res.json({ data: [] });
}
