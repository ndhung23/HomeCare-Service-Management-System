import express from 'express';
import {
  getPendingKycList,
  approveKyc,
  rejectKyc,
  getUsersList,
  toggleLockUser,
  getAdminStats,
} from '../controllers/adminController.js';
import { confirmPaymentByAdmin, getAdminPaymentsList, rejectPaymentByAdmin } from '../controllers/paymentController.js';
import {
  getAdminWithdrawRequests,
  approveWithdrawRequest,
  rejectWithdrawRequest,
} from '../controllers/walletController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Tất cả endpoints trong router này yêu cầu đăng nhập và có role admin
router.use(protect, authorize('admin'));

// Thống kê tổng quan
router.get('/stats', getAdminStats);

// Quản lý người dùng
router.get('/users', getUsersList);
router.put('/users/:userId/lock', toggleLockUser);

// Quản lý KYC Cấp 2
router.get('/kyc/pending', getPendingKycList);
router.put('/kyc/:userId/approve', approveKyc);
router.put('/kyc/:userId/reject', rejectKyc);

// Quản lý duyệt thanh toán (VietQR đối soát / VNPay sau này)
router.get('/payments', getAdminPaymentsList);
router.put('/bookings/:id/confirm-payment', confirmPaymentByAdmin);
router.put('/bookings/:id/reject-payment', rejectPaymentByAdmin);

// Quản lý lệnh rút tiền
router.get('/withdraws', getAdminWithdrawRequests);
router.put('/withdraws/:id/approve', approveWithdrawRequest);
router.put('/withdraws/:id/reject', rejectWithdrawRequest);

export default router;

