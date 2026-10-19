import express from 'express';
import { getAllReviews, createReview } from '../controllers/reviewController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getAllReviews);
router.post('/', protect, createReview);

export default router;
