import express from 'express';
import {
  getPendingKycList,
  approveKyc,
  rejectKyc,
  getUsersList,
  toggleLockUser,
  getAdminStats,
  getSystemConfig,
  updateSystemConfig,
  getContentItems,
  createOrUpdateContentItem,
  deleteContentItem,
  removeUserViolation,
} from '../controllers/adminController.js';
import { confirmPaymentByAdmin, getAdminPaymentsList, rejectPaymentByAdmin } from '../controllers/paymentController.js';
import {
  getAdminWithdrawRequests,
  approveWithdrawRequest,
  rejectWithdrawRequest,
} from '../controllers/walletController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Công khai đọc cấu hình và nội dung FAQ/Tin tức
router.get('/config', getSystemConfig);
router.get('/content', getContentItems);

// Tất cả endpoints quản trị tiếp theo yêu cầu đăng nhập và có role admin
router.use(protect, authorize('admin'));

// Thống kê tổng quan
router.get('/stats', getAdminStats);

// Quản lý người dùng & vi phạm
router.get('/users', getUsersList);
router.put('/users/:userId/lock', toggleLockUser);
router.delete('/users/:userId/violations/:violationId', removeUserViolation);

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

// Cấu hình bảng giá và hệ thống động (Role.md Mục 14)
router.put('/config', updateSystemConfig);

// Quản lý nội dung (FAQ / Tin tức / Chính sách)
router.post('/content', createOrUpdateContentItem);
router.put('/content/:id', createOrUpdateContentItem);
router.delete('/content/:id', deleteContentItem);

export default router;


