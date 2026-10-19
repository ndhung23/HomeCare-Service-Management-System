import express from 'express';
import { submitKyc, getMyKycStatus } from '../controllers/kycController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/status', protect, getMyKycStatus);
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 },
    { name: 'businessLicense', maxCount: 1 },
  ]),
  submitKyc
);

export default router;

