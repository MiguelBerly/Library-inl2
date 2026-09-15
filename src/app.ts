import express from 'express';
import swaggerUi from 'swagger-ui-express';
import bookRoutes from './routes/bookRoutes.ts';
import genreRoutes from './routes/genreRoutes.ts';
import authorRoutes from './routes/authorRoutes.ts';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.ts';
import { openApiSpec } from './docs/openapi.ts';

const app = express();

app.use(express.json());

app.use('/api/books', bookRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/authors', authorRoutes);

app.get('/api-docs.json', (_req, res) => {
    res.json(openApiSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
