import express from 'express';
import { getBookingPaymentInfo } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id', protect, getBookingPaymentInfo);

export default router;

