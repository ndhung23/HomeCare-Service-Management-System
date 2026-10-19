import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  getMarketBookings,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/bookingController.js';
import {
  acceptBooking,
  startBooking,
  completeBooking,
  cancelBooking,
} from '../controllers/bookingLifecycleController.js';
import { protect, authorize, requireKycLevel } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/market', protect, getMarketBookings);
router.get('/', protect, getAllBookings);
router.get('/:id', protect, getBookingById);
router.post('/', protect, createBooking);

// Vòng đời đơn
router.put('/:id/accept', protect, requireKycLevel(2), acceptBooking);
router.put('/:id/start', protect, startBooking);
router.put('/:id/complete', protect, upload.array('evidence', 5), completeBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Admin only
router.put('/:id', protect, authorize('admin'), updateBookingStatus);
router.delete('/:id', protect, authorize('admin'), deleteBooking);

export default router;
