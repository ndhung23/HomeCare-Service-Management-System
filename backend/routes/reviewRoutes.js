import express from 'express';
import {
  getAllReviews,
  createReview,
  updateReview,
  toggleReviewVisibility,
} from '../controllers/reviewController.js';
import { protect, optionalProtect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getAllReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.put('/:id/visibility', protect, authorize('admin'), toggleReviewVisibility);

export default router;

