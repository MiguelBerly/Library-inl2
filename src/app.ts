import express from 'express';
import bookRoutes from './routes/bookRoutes.ts';

const app = express();

app.use(express.json());

app.use('/api/books', bookRoutes);

export default app;
