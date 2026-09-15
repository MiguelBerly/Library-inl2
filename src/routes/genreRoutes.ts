import { Router } from 'express';
import { getGenres, getGenreBooks } from '../controllers/genreController.ts';

const router = Router();

router.get('/', getGenres);
router.get('/:slug/books', getGenreBooks);

export default router;
