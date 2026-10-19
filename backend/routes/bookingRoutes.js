import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  getMarketBookings,
  getMySpending,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/bookingController.js';
import {
  acceptBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  respondCancelRequest,
  reportNoshow,
  reassignEmployee,
  respondInvite,
} from '../controllers/bookingLifecycleController.js';
import { protect, authorize, requireKycLevel } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/market', protect, getMarketBookings);
router.get('/my-spending', protect, getMySpending);
router.get('/', protect, getAllBookings);
router.get('/:id', protect, getBookingById);
router.post('/', protect, createBooking);

// Vòng đời đơn
router.put('/:id/accept', protect, requireKycLevel(2), acceptBooking);
router.put('/:id/start', protect, startBooking);
router.put('/:id/complete', protect, upload.array('evidence', 5), completeBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/cancel-response', protect, respondCancelRequest);
router.post('/:id/report-noshow', protect, reportNoshow);
router.put('/:id/reassign-employee', protect, reassignEmployee);
router.put('/:id/respond-invite', protect, respondInvite);

// Admin only
router.put('/:id', protect, authorize('admin'), updateBookingStatus);
router.delete('/:id', protect, authorize('admin'), deleteBooking);

export default router;
