import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.ts';
import { useTestDb } from './helpers/testDb.ts';

useTestDb();

describe('GET /api/authors', () => {
    it('responds with 200 and all authors', async () => {
        const res = await request(app).get('/api/authors');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.data[1]).toMatchObject({ id: 2, name: 'Ursula K. Le Guin' });
    });
});

describe('GET /api/authors/:id/books', () => {
    it('responds with 200 and only the books by that author', async () => {
        const res = await request(app).get('/api/authors/2/books');

        expect(res.status).toBe(200);
        expect(res.body.data.map((book: { id: number }) => book.id)).toEqual([2, 3]);
    });

    it('responds with 404 when the author does not exist', async () => {
        const res = await request(app).get('/api/authors/999/books');

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/author/i);
    });

    it('responds with 400 when the id is not a positive integer', async () => {
        const res = await request(app).get('/api/authors/abc/books');

        expect(res.status).toBe(400);
        expect(res.body.error).toEqual(expect.any(String));
    });
});
