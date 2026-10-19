import express from 'express';
import { createDispute, getDisputes, resolveDispute } from '../controllers/disputeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createDispute);
router.get('/', getDisputes);
router.put('/:id/resolve', authorize('admin'), resolveDispute);

export default router;

