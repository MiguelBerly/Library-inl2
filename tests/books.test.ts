import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.ts';

describe('GET /api/books', () => {
    it('responds with 200 and a list of books', async () => {
        const res = await request(app).get('/api/books');

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});