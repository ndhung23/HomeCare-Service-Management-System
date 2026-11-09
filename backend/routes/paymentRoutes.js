import express from 'express';
import { getBookingPaymentInfo, customerPayBooking } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id', protect, getBookingPaymentInfo);
router.post('/:id/pay', protect, customerPayBooking);

export default router;

