# Library API

A REST API for books, authors and genres. Built with Node.js, Express and TypeScript, with data stored in a JSON file.

## Getting started

Requires Node.js 24 or later.

```bash
git clone https://github.com/MiguelBerly/Library-inl2.git
cd Library-inl2
npm install
npm run dev
```

The API runs at http://localhost:3000. Run the tests with `npm test`.

## Documentation

Interactive API docs (Swagger UI): **http://localhost:3000/api-docs**

The OpenAPI spec is available as JSON at http://localhost:3000/api-docs.json.

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/books` | All books |
| GET | `/api/books?genre=mystery&author=3` | Filter by genre slug and/or author id |
| GET | `/api/books/:id` | One book |
| POST | `/api/books` | Create a book |
| PUT | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Delete a book |
| GET | `/api/genres` | All genres |
| GET | `/api/genres/:slug/books` | Books in a genre, e.g. `/api/genres/horror/books` |
| GET | `/api/authors` | All authors |
| GET | `/api/authors/:id/books` | Books by an author |

### Pagination

Book lists return 10 books per page. Use `page` and `limit` (max 50), e.g. `/api/books?page=2&limit=5`. The response includes a `pagination` object with `page`, `limit`, `total` and `totalPages`.

### Creating or updating a book

`POST` and `PUT` take a JSON body where all fields are required:

```json
{ "title": "Dune", "authorId": 7, "genreId": 2, "year": 1965 }
```

`authorId` and `genreId` must belong to an existing author and genre. HTML is removed from the title before it is saved.

### Responses

Results are wrapped in `data`:

```json
{ "data": { "id": 13, "title": "Dune", "authorId": 7, "genreId": 2, "year": 1965 } }
```

Errors return a message:

```json
{ "error": "No book with id 999" }
```

| Status | Meaning |
|---|---|
| 200 / 201 / 204 | OK / created / deleted |
| 400 | Invalid id, filter, page, limit or body |
| 404 | Not found |
| 503 | The data file is missing or corrupt |
