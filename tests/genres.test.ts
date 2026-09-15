import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.ts';
import { useTestDb } from './helpers/testDb.ts';

useTestDb();

describe('GET /api/genres', () => {
    it('responds with 200 and all genres', async () => {
        const res = await request(app).get('/api/genres');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.data[0]).toMatchObject({ id: 1, name: 'Fantasy', slug: 'fantasy' });
    });
});

describe('GET /api/genres/:slug/books', () => {
    it('responds with 200 and only the books in that genre', async () => {
        const res = await request(app).get('/api/genres/fantasy/books');

        expect(res.status).toBe(200);
        expect(res.body.data.map((book: { id: number }) => book.id)).toEqual([1, 3]);
    });

    it('paginates the books in the genre', async () => {
        const res = await request(app).get('/api/genres/fantasy/books?limit=1');

        expect(res.body.data.map((book: { id: number }) => book.id)).toEqual([1]);
        expect(res.body.pagination).toEqual({ page: 1, limit: 1, total: 2, totalPages: 2 });
    });

    it('responds with 404 when the genre does not exist', async () => {
        const res = await request(app).get('/api/genres/poetry/books');

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/genre/i);
    });
});
