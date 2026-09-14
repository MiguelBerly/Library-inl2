import { Router } from 'express';
import { getBooks, getBookById, postBook } from '../controllers/bookController.ts';

const router = Router();

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', postBook);

export default router;
