import express from 'express';
import {
  getMyWallet,
  updateBankInfo,
  requestWithdraw,
} from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyWallet);
router.put('/bank', protect, updateBankInfo);
router.post('/withdraw', protect, requestWithdraw);

export default router;

