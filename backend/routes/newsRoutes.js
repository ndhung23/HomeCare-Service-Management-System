import express from 'express';
import { getAllNews, createArticle } from '../controllers/newsController.js';

const router = express.Router();

router.get('/', getAllNews);
router.post('/', createArticle);

export default router;

