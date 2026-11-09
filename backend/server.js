import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: './backend/.env' });
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import kycRoutes from './routes/kycRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect MongoDB with caching for serverless
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes('127.0.0.1')) {
    if (process.env.VERCEL) {
      console.warn('⚠️ VERCEL: MONGO_URI is not configured in Vercel Environment Variables. Set it in Vercel Settings -> Environment Variables.');
      return;
    }
  }

  try {
    await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/homecare', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

// DB connect middleware - đảm bảo kết nối trước khi vào controllers
app.use(async (req, res, next) => {
  if (req.path === '/') return next();
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connect error:', err.message);
  }
  next();
});

// Root Healthcheck endpoints (luôn phản hồi 200)
app.get('/', (req, res) => {
  res.status(200).send('HomeCare Service Management API is running on Vercel!');
});

app.get('/api', (req, res) => {
  res.status(200).json({ status: 'online', service: 'GiupViec24 Backend', time: new Date() });
});

app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API Backend is running!',
    mongoStatus: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED / CONNECTING',
    nodeEnv: process.env.NODE_ENV,
    isVercel: Boolean(process.env.VERCEL),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/helpers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/disputes', disputeRoutes);

// Khởi chạy server khi chạy ở môi trường local / VPS (không chạy trên Vercel Serverless)
if (!process.env.VERCEL) {
  connectDB().catch(() => {});
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
