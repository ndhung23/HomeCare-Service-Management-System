import express from 'express';
import { register, login, getAllUsers, getMe } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getAllUsers);
router.get('/me', getMe);

export default router;

