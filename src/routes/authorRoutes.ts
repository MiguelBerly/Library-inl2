import { Router } from 'express';
import { getAuthors, getAuthorBooks } from '../controllers/authorController.ts';

const router = Router();

router.get('/', getAuthors);
router.get('/:id/books', getAuthorBooks);

export default router;
