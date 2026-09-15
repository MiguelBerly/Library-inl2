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

describe('GET /api/books with filters', () => {
    function ids(res: request.Response): number[] {
        return res.body.data.map((book: { id: number }) => book.id);
    }

    it('returns only books in the given genre', async () => {
        const res = await request(app).get('/api/books?genre=fantasy');

        expect(res.status).toBe(200);
        expect(ids(res)).toEqual([1, 3]);
    });

    it('matches the genre regardless of upper or lower case', async () => {
        const res = await request(app).get('/api/books?genre=FANTASY');

        expect(ids(res)).toEqual([1, 3]);
    });

    it('returns only books by the given author', async () => {
        const res = await request(app).get('/api/books?author=2');

        expect(ids(res)).toEqual([2, 3]);
    });

    it('combines filters', async () => {
        const res = await request(app).get('/api/books?genre=fantasy&author=2');

        expect(ids(res)).toEqual([3]);
    });

    it('returns an empty list when nothing matches', async () => {
        const res = await request(app).get('/api/books?genre=poetry');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });

    it('responds with 400 when the author filter is not a positive integer', async () => {
        const res = await request(app).get('/api/books?author=abc');

        expect(res.status).toBe(400);
        expect(res.body.error).toEqual(expect.any(String));
    });
});

describe('GET /api/books with pagination', () => {
    function ids(res: request.Response): number[] {
        return res.body.data.map((book: { id: number }) => book.id);
    }

    it('returns page 1 with a limit of 10 by default, with pagination info', async () => {
        const res = await request(app).get('/api/books');

        expect(res.body.pagination).toEqual({ page: 1, limit: 10, total: 3, totalPages: 1 });
    });

    it('returns only as many books as the limit', async () => {
        const res = await request(app).get('/api/books?limit=2');

        expect(ids(res)).toEqual([1, 2]);
        expect(res.body.pagination).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 });
    });

    it('returns the books on the requested page', async () => {
        const res = await request(app).get('/api/books?page=2&limit=2');

        expect(ids(res)).toEqual([3]);
        expect(res.body.pagination).toMatchObject({ page: 2, limit: 2 });
    });

    it('returns an empty list for a page after the last one', async () => {
        const res = await request(app).get('/api/books?page=5&limit=2');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });

    it('paginates the filtered result', async () => {
        const res = await request(app).get('/api/books?genre=fantasy&page=2&limit=1');

        expect(ids(res)).toEqual([3]);
        expect(res.body.pagination).toEqual({ page: 2, limit: 1, total: 2, totalPages: 2 });
    });

    it.each(['page=0', 'page=abc', 'limit=0', 'limit=1.5', 'limit=51'])(
        'responds with 400 for invalid pagination (%s)',
        async (query) => {
            const res = await request(app).get(`/api/books?${query}`);

            expect(res.status).toBe(400);
            expect(res.body.error).toEqual(expect.any(String));
        },
    );
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

describe('DELETE /api/books/:id', () => {
    it('responds with 204 and an empty body', async () => {
        const res = await request(app).delete('/api/books/1');

        expect(res.status).toBe(204);
        expect(res.text).toBe('');
    });

    it('removes the book so it can no longer be fetched', async () => {
        await request(app).delete('/api/books/1');
        const res = await request(app).get('/api/books/1');

        expect(res.status).toBe(404);
    });

    it('responds with 404 when the book does not exist', async () => {
        const res = await request(app).delete('/api/books/999');

        expect(res.status).toBe(404);
        expect(res.body.error).toEqual(expect.any(String));
    });

    it('responds with 400 when the id is not a positive integer', async () => {
        const res = await request(app).delete('/api/books/abc');

        expect(res.status).toBe(400);
        expect(res.body.error).toEqual(expect.any(String));
    });
});
