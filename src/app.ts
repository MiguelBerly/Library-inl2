import express from 'express';

const app = express();

app.use(express.json());

app.get('/api/books', (_req, res) => {
    res.json({ data: [] });
});

export default app;