import express from 'express';
import { register, login, getAllUsers, getMe, addEmployee } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', getAllUsers);
router.post('/employees', protect, addEmployee);

export default router;

