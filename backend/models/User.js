import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'enterprise', 'helper', 'customer'],
      default: 'customer',
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    },
    address: {
      type: String,
      default: '',
    },
    roleName: {
      type: String,
      default: 'Khách hàng',
    },
    redirectPath: {
      type: String,
      default: '/',
    },
    dashboardPath: {
      type: String,
      default: '/customer',
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;

