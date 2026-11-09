import express from 'express';
import {
  register,
  login,
  getAllUsers,
  getMe,
  addEmployee,
  updateProfile,
  cancelProfileUpdateRequest,
  changePassword,
  updateAvailability,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.get('/users', getAllUsers);
router.post('/employees', protect, addEmployee);
router.put('/profile', protect, updateProfile);
router.delete('/profile/pending-update', protect, cancelProfileUpdateRequest);
router.put('/change-password', protect, changePassword);
router.put('/availability', protect, updateAvailability);

export default router;

