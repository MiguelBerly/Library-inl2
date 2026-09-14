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

describe('POST /api/books', () => {
    const newBook = { title: 'The Fellowship of the Ring', authorId: 1, genreId: 1, year: 1954 };

    it('responds with 201 and the created book with a new id', async () => {
        const res = await request(app).post('/api/books').send(newBook);

        expect(res.status).toBe(201);
        expect(res.body.data).toEqual({ id: 4, ...newBook });
    });

    it('saves the book so it can be fetched afterwards', async () => {
        const created = await request(app).post('/api/books').send(newBook);
        const res = await request(app).get(`/api/books/${created.body.data?.id}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toMatchObject(newBook);
    });

    it('responds with 400 and lists the problems when fields are missing or invalid', async () => {
        const res = await request(app).post('/api/books').send({ title: '', year: 'soon' });

        expect(res.status).toBe(400);
        expect(res.body.error).toEqual(expect.any(String));
        expect(res.body.details).toEqual(
            expect.arrayContaining([expect.stringMatching(/title/), expect.stringMatching(/year/)]),
        );
    });

    it('responds with 400 when the author does not exist', async () => {
        const res = await request(app).post('/api/books').send({ ...newBook, authorId: 999 });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/author/i);
    });
});

describe('PUT /api/books/:id', () => {
    const updatedBook = { title: 'The Hobbit, or There and Back Again', authorId: 1, genreId: 1, year: 1937 };

    it('responds with 200 and the updated book', async () => {
        const res = await request(app).put('/api/books/1').send(updatedBook);

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({ id: 1, ...updatedBook });
    });

    it('saves the changes so they can be fetched afterwards', async () => {
        await request(app).put('/api/books/1').send(updatedBook);
        const res = await request(app).get('/api/books/1');

        expect(res.body.data).toEqual({ id: 1, ...updatedBook });
    });

    it('responds with 404 when the book does not exist', async () => {
        const res = await request(app).put('/api/books/999').send(updatedBook);

        expect(res.status).toBe(404);
        expect(res.body.error).toEqual(expect.any(String));
    });

    it('responds with 400 when the body is invalid', async () => {
        const res = await request(app).put('/api/books/1').send({ title: '' });

        expect(res.status).toBe(400);
        expect(res.body.details).toEqual(expect.arrayContaining([expect.stringMatching(/title/)]));
    });
});
