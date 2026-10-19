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
    status: {
      type: String,
      enum: ['ACTIVE', 'LOCKED'],
      default: 'ACTIVE',
    },
    lockReason: {
      type: String,
      default: '',
    },
    kycLevel: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    kyc: {
      status: {
        type: String,
        enum: ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'],
        default: 'NOT_SUBMITTED',
      },
      fullName: { type: String, default: '' },
      dob: { type: String, default: '' },
      gender: { type: String, default: '' },
      idNumber: { type: String, default: '' },
      avatarUrl: { type: String, default: '' },
      idFrontUrl: { type: String, default: '' },
      idBackUrl: { type: String, default: '' },
      businessLicenseUrl: { type: String, default: '' },
      companyName: { type: String, default: '' },
      taxCode: { type: String, default: '' },
      rejectReason: { type: String, default: '' },
      submittedAt: { type: Date },
      reviewedAt: { type: Date },
    },
    bank: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      accountName: { type: String, default: '' },
    },
    wallet: {
      available: {
        type: Number,
        default: 0,
      },
      locked: {
        type: Number,
        default: 0,
      },
    },
    employees: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        phone: { type: String, default: '' },
        birthYear: { type: Number },
        gender: { type: String, default: 'Nữ' },
        avatar: { type: String, default: '' },
        status: { type: String, enum: ['AVAILABLE', 'BUSY', 'OFF'], default: 'AVAILABLE' },
      },
    ],
    violations: [
      {
        reason: { type: String, required: true },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
        bookingCode: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
        removedByAdmin: { type: Boolean, default: false },
        adminNote: { type: String, default: '' },
      },
    ],
    jobClaimLockedUntil: {
      type: Date,
      default: null,
    },
    isAvailableForJobs: {
      type: Boolean,
      default: true,
    },
    servingRadiusKm: {
      type: Number,
      default: 10,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);
export default User;

