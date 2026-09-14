import { Router } from 'express';
import { getBooks } from '../controllers/bookController.ts';

const router = Router();

router.get('/', getBooks);

export default router;
