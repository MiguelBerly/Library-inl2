import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.ts';
import { useTestDb } from './helpers/testDb.ts';

useTestDb();

describe('GET /api/books', () => {
    it('responds with 200 and a list of books', async () => {
        const res = await request(app).get('/api/books');

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns the books stored in the database', async () => {
        const res = await request(app).get('/api/books');

        expect(res.body.data).toHaveLength(3);
        expect(res.body.data[0]).toMatchObject({ id: 1, title: 'The Hobbit' });
    });
});

describe('GET /api/books/:id', () => {
    it('responds with 200 and the book with that id', async () => {
        const res = await request(app).get('/api/books/2');

        expect(res.status).toBe(200);
        expect(res.body.data).toMatchObject({ id: 2, title: 'The Left Hand of Darkness' });
    });

    it('responds with 404 and an error message when the book does not exist', async () => {
        const res = await request(app).get('/api/books/999');

        expect(res.status).toBe(404);
        expect(res.body.error).toEqual(expect.any(String));
    });

    it('responds with 400 when the id is not a positive integer', async () => {
        const res = await request(app).get('/api/books/abc');

        expect(res.status).toBe(400);
        expect(res.body.error).toEqual(expect.any(String));
    });
});
