import { DEFAULT_LIMIT, MAX_LIMIT } from '../utils/pagination.ts';

const errorResponse = (description: string, example: string) => ({
    description,
    content: {
        'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { error: example },
        },
    },
});

const responses = {
    InvalidId: errorResponse('The id is not a positive integer', 'Id must be a positive integer'),
    InvalidPagination: errorResponse('Invalid page or limit', 'page must be a positive integer'),
    InvalidBook: {
        description: 'The body is invalid, or the author or genre does not exist',
        content: {
            'application/json': {
                schema: { $ref: '#/components/schemas/ValidationError' },
            },
        },
    },
    BookNotFound: errorResponse('No book with that id', 'No book with id 999'),
    DatabaseUnavailable: errorResponse(
        'The data file is missing or corrupt',
        'The database is unavailable, please try again later',
    ),
};

const parameters = {
    BookId: { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 }, example: 1 },
    AuthorId: { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 }, example: 2 },
    GenreSlug: { name: 'slug', in: 'path', required: true, schema: { type: 'string' }, example: 'fantasy' },
    Page: {
        name: 'page',
        in: 'query',
        description: 'Page number',
        schema: { type: 'integer', minimum: 1, default: 1 },
    },
    Limit: {
        name: 'limit',
        in: 'query',
        description: 'Number of books per page',
        schema: { type: 'integer', minimum: 1, maximum: MAX_LIMIT, default: DEFAULT_LIMIT },
    },
};

const bookListResponse = {
    description: 'A page of books',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/BookPage' } } },
};

const bookResponse = (description: string) => ({
    description,
    content: {
        'application/json': {
            schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Book' } } },
        },
    },
});

const bookBody = {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/BookInput' } } },
};

export const openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Library API',
        version: '1.0.0',
        description:
            'A REST API for books, authors and genres. Lists of books are paginated and can be filtered by genre and author.',
    },
    tags: [
        { name: 'Books', description: 'Create, read, update and delete books' },
        { name: 'Genres', description: 'Genres and the books in each genre' },
        { name: 'Authors', description: 'Authors and the books by each author' },
    ],
    paths: {
        '/api/books': {
            get: {
                tags: ['Books'],
                summary: 'List books',
                parameters: [
                    {
                        name: 'genre',
                        in: 'query',
                        description: 'Only books in this genre (slug, not case sensitive)',
                        schema: { type: 'string' },
                        example: 'mystery',
                    },
                    {
                        name: 'author',
                        in: 'query',
                        description: 'Only books by the author with this id',
                        schema: { type: 'integer', minimum: 1 },
                    },
                    { $ref: '#/components/parameters/Page' },
                    { $ref: '#/components/parameters/Limit' },
                ],
                responses: {
                    200: bookListResponse,
                    400: errorResponse('Invalid filter, page or limit', 'The author filter must be a positive integer'),
                    503: { $ref: '#/components/responses/DatabaseUnavailable' },
                },
            },
            post: {
                tags: ['Books'],
                summary: 'Create a book',
                description: 'HTML is stripped from the title before it is saved. Unknown fields are ignored.',
                requestBody: bookBody,
                responses: {
                    201: bookResponse('The created book'),
                    400: { $ref: '#/components/responses/InvalidBook' },
                    503: { $ref: '#/components/responses/DatabaseUnavailable' },
                },
            },
        },
        '/api/books/{id}': {
            parameters: [{ $ref: '#/components/parameters/BookId' }],
            get: {
                tags: ['Books'],
                summary: 'Get a book',
                responses: {
                    200: bookResponse('The book'),
                    400: { $ref: '#/components/responses/InvalidId' },
                    404: { $ref: '#/components/responses/BookNotFound' },
                    503: { $ref: '#/components/responses/DatabaseUnavailable' },
                },
            },
            put: {
                tags: ['Books'],
                summary: 'Replace a book',
                description: 'Takes the same body and rules as creating a book.',
                requestBody: bookBody,
                responses: {
                    200: bookResponse('The updated book'),
                    400: { $ref: '#/components/responses/InvalidBook' },
                    404: { $ref: '#/components/responses/BookNotFound' },
                    503: { $ref: '#/components/responses/DatabaseUnavailable' },
                },
            },
            delete: {
                tags: ['Books'],
                summary: 'Delete a book',
                responses: {
                    204: { description: 'The book was deleted' },
                    400: { $ref: '#/components/responses/InvalidId' },
                    404: { $ref: '#/components/responses/BookNotFound' },
                    503: { $ref: '#/components/responses/DatabaseUnavailable' },
                },
            },
        },
        '/api/genres': {
            get: {
                tags: ['Genres'],
                summary: 'List genres',
                responses: {
                    200: {
                        description: 'All genres',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Genre' } } },
                                },
                            },
                        },
                    },
                    503: { $ref: '#/components/responses/DatabaseUnavailable' },
                },
            },
        },
        '/api/genres/{slug}/books': {
            get: {
                tags: ['Genres'],
                summary: 'List the books in a genre',
                parameters: [
                    { $ref: '#/components/parameters/GenreSlug' },
                    { $ref: '#/components/parameters/Page' },
                    { $ref: '#/components/parameters/Limit' },
                ],
                responses: {
                    200: bookListResponse,
                    400: { $ref: '#/components/responses/InvalidPagination' },
                    404: errorResponse('No genre with that slug', 'No genre called poetry'),
                    503: { $ref: '#/components/responses/DatabaseUnavailable' },
                },
            },
        },
        '/api/authors': {
            get: {
                tags: ['Authors'],
                summary: 'List authors',
                responses: {
                    200: {
                        description: 'All authors',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Author' } } },
                                },
                            },
                        },
                    },
                    503: { $ref: '#/components/responses/DatabaseUnavailable' },
                },
            },
        },
        '/api/authors/{id}/books': {
            get: {
                tags: ['Authors'],
                summary: 'List the books by an author',
                parameters: [
                    { $ref: '#/components/parameters/AuthorId' },
                    { $ref: '#/components/parameters/Page' },
                    { $ref: '#/components/parameters/Limit' },
                ],
                responses: {
                    200: bookListResponse,
                    400: errorResponse('Invalid id, page or limit', 'Id must be a positive integer'),
                    404: errorResponse('No author with that id', 'No author with id 999'),
                    503: { $ref: '#/components/responses/DatabaseUnavailable' },
                },
            },
        },
    },
    components: {
        schemas: {
            Book: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 13 },
                    title: { type: 'string', example: 'Dune' },
                    authorId: { type: 'integer', example: 7 },
                    genreId: { type: 'integer', example: 2 },
                    year: { type: 'integer', example: 1965 },
                },
            },
            BookInput: {
                type: 'object',
                required: ['title', 'authorId', 'genreId', 'year'],
                properties: {
                    title: { type: 'string', maxLength: 200, example: 'The Two Towers' },
                    authorId: { type: 'integer', minimum: 1, description: 'Id of an existing author', example: 1 },
                    genreId: { type: 'integer', minimum: 1, description: 'Id of an existing genre', example: 1 },
                    year: { type: 'integer', description: 'Not later than the current year', example: 1954 },
                },
            },
            Author: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 6 },
                    name: { type: 'string', example: 'Astrid Lindgren' },
                    nationality: { type: 'string', example: 'Swedish' },
                },
            },
            Genre: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'Fantasy' },
                    slug: { type: 'string', example: 'fantasy' },
                },
            },
            BookPage: {
                type: 'object',
                properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Book' } },
                    pagination: {
                        type: 'object',
                        properties: {
                            page: { type: 'integer', example: 1 },
                            limit: { type: 'integer', example: DEFAULT_LIMIT },
                            total: { type: 'integer', example: 16 },
                            totalPages: { type: 'integer', example: 2 },
                        },
                    },
                },
            },
            Error: {
                type: 'object',
                properties: { error: { type: 'string' } },
            },
            ValidationError: {
                type: 'object',
                properties: {
                    error: { type: 'string', example: 'Invalid book' },
                    details: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['title is required and must be a non-empty string'],
                    },
                },
            },
        },
        parameters,
        responses,
    },
};
