import type { ErrorRequestHandler, RequestHandler } from 'express';
import { DatabaseError } from '../db/storage.ts';

export const notFoundHandler: RequestHandler = (_req, res) => {
    res.status(404).json({ error: 'Route not found' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (process.env.NODE_ENV !== 'test') {
        console.error(err);
    }

    if (err instanceof DatabaseError) {
        res.status(503).json({ error: 'The database is unavailable, please try again later' });
        return;
    }

    if (err?.type === 'entity.parse.failed') {
        res.status(400).json({ error: 'The request body is not valid JSON' });
        return;
    }

    res.status(500).json({ error: 'Internal server error' });
};
