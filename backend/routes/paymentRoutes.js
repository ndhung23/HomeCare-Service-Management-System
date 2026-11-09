import express from 'express';
import {
  getBookingPaymentInfo,
  customerPayBooking,
  handlePayOSWebhook,
  checkBookingPaymentStatus,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Webhook từ PayOS (không dùng middleware protect vì PayOS server gọi vào)
router.post('/payos-webhook', handlePayOSWebhook);

// Kiểm tra trạng thái đơn hàng (cho frontend polling)
router.get('/:id/status', checkBookingPaymentStatus);

// Lấy thông tin thanh toán VietQR
router.get('/:id', protect, getBookingPaymentInfo);

// Khách hàng xác nhận thanh toán
router.post('/:id/pay', protect, customerPayBooking);

export default router;
