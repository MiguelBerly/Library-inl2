import { describe, it, expect } from 'vitest';
import { rm, writeFile } from 'node:fs/promises';
import request from 'supertest';
import app from '../src/app.ts';
import { useTestDb } from './helpers/testDb.ts';

useTestDb();

function dbPath(): string {
    return process.env.DB_PATH as string;
}

describe('when the database is unavailable', () => {
    it('responds with 503 and a JSON error when the database file is missing', async () => {
        await rm(dbPath());

        const res = await request(app).get('/api/books');

        expect(res.status).toBe(503);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.body.error).toEqual(expect.any(String));
    });

    it('responds with 503 when the database file is not valid JSON', async () => {
        await writeFile(dbPath(), '{ broken json');

        const res = await request(app).get('/api/books/1');

        expect(res.status).toBe(503);
        expect(res.body.error).toEqual(expect.any(String));
    });

    it('responds with 503 when the database file has the wrong shape', async () => {
        await writeFile(dbPath(), JSON.stringify({ books: 'not a list' }));

        const res = await request(app).get('/api/books');

        expect(res.status).toBe(503);
    });

    it('does not leak internal details such as stack traces', async () => {
        await writeFile(dbPath(), '{ broken json');

        const res = await request(app).get('/api/books');

        expect(res.text).not.toMatch(/SyntaxError|\.ts:\d+/);
    });
});

describe('invalid requests', () => {
    it('responds with 404 and a JSON error for unknown routes', async () => {
        const res = await request(app).get('/api/does-not-exist');

        expect(res.status).toBe(404);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.body.error).toEqual(expect.any(String));
    });

    it('responds with 400 and a JSON error when the request body is not valid JSON', async () => {
        const res = await request(app)
            .post('/api/books')
            .set('Content-Type', 'application/json')
            .send('{ "title": ');

        expect(res.status).toBe(400);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.body.error).toEqual(expect.any(String));
    });
});
