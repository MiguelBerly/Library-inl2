import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.ts';

describe('API documentation', () => {
    it('serves the Swagger UI page at /api-docs', async () => {
        const res = await request(app).get('/api-docs/');

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/html/);
        expect(res.text).toMatch(/swagger-ui/i);
    });

    it('serves the OpenAPI spec as JSON at /api-docs.json', async () => {
        const res = await request(app).get('/api-docs.json');

        expect(res.status).toBe(200);
        expect(res.body.openapi).toMatch(/^3\./);
    });

    it('documents every endpoint', async () => {
        const res = await request(app).get('/api-docs.json');
        const paths = res.body.paths ?? {};

        expect(Object.keys(paths)).toEqual(
            expect.arrayContaining([
                '/api/books',
                '/api/books/{id}',
                '/api/genres',
                '/api/genres/{slug}/books',
                '/api/authors',
                '/api/authors/{id}/books',
            ]),
        );
        expect(Object.keys(paths['/api/books'])).toEqual(expect.arrayContaining(['get', 'post']));
        expect(Object.keys(paths['/api/books/{id}'])).toEqual(expect.arrayContaining(['get', 'put', 'delete']));
    });
});
