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
