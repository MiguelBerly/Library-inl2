import express from 'express';
import bookRoutes from './routes/bookRoutes.ts';
import genreRoutes from './routes/genreRoutes.ts';
import authorRoutes from './routes/authorRoutes.ts';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.ts';

const app = express();

app.use(express.json());

app.use('/api/books', bookRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/authors', authorRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
