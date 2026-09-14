import { Router } from 'express';
import { getBooks, getBookById, postBook, putBook } from '../controllers/bookController.ts';

const router = Router();

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', postBook);
router.put('/:id', putBook);

export default router;
