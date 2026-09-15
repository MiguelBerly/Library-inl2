import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.ts';
import { useTestDb } from './helpers/testDb.ts';

useTestDb();

const validBook = { title: 'Dune', authorId: 2, genreId: 2, year: 1965 };

async function createWithTitle(title: string): Promise<request.Response> {
    return request(app).post('/api/books').send({ ...validBook, title });
}

describe('sanitizing book input', () => {
    it('removes HTML tags from the title', async () => {
        const res = await createWithTitle('<b>Dune</b>');

        expect(res.status).toBe(201);
        expect(res.body.data.title).toBe('Dune');
    });

    it('removes script tags together with their content', async () => {
        const res = await createWithTitle('<script>alert("hacked")</script>Dune');

        expect(res.body.data.title).toBe('Dune');
    });

    it('never stores angle brackets, even from broken tags', async () => {
        const res = await createWithTitle('Dune <img src=x onerror=alert(1)');

        expect(res.status).toBe(201);
        expect(res.body.data.title).not.toMatch(/[<>]/);
    });

    it('saves the sanitized title, not the original', async () => {
        const created = await createWithTitle('<i>Dune</i>');
        const res = await request(app).get(`/api/books/${created.body.data?.id}`);

        expect(res.body.data.title).toBe('Dune');
    });

    it('sanitizes the title when a book is updated', async () => {
        const res = await request(app).put('/api/books/1').send({ ...validBook, title: '<h1>The Hobbit</h1>' });

        expect(res.body.data.title).toBe('The Hobbit');
    });

    it('responds with 400 when the title is empty after sanitizing', async () => {
        const res = await createWithTitle('<b></b>');

        expect(res.status).toBe(400);
        expect(res.body.details).toEqual(expect.arrayContaining([expect.stringMatching(/title/)]));
    });

    it('responds with 400 when the title is longer than 200 characters', async () => {
        const res = await createWithTitle('a'.repeat(201));

        expect(res.status).toBe(400);
        expect(res.body.details).toEqual(expect.arrayContaining([expect.stringMatching(/title/)]));
    });
});

describe('sanitizing error messages', () => {
    it('does not echo HTML from the URL back in the error message', async () => {
        const res = await request(app).get('/api/genres/%3Cscript%3Ealert(1)%3C%2Fscript%3E/books');

        expect(res.status).toBe(404);
        expect(res.body.error).not.toMatch(/[<>]/);
    });
});
