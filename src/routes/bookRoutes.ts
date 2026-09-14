import { Router } from 'express';
import { getBooks, getBookById, postBook, putBook, deleteBook } from '../controllers/bookController.ts';

const router = Router();

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', postBook);
router.put('/:id', putBook);
router.delete('/:id', deleteBook);

export default router;
