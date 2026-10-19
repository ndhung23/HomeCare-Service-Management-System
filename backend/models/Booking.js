import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      default: '',
    },
    customerEmail: {
      type: String,
      default: '',
    },
    customerPhone: {
      type: String,
      default: '',
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    service: {
      type: String,
      required: true,
    },
    serviceId: {
      type: String,
      default: '',
    },
    serviceCode: {
      type: String,
      default: '',
    },
    preferredHelperId: {
      type: String,
      default: '',
    },
    helper: {
      type: String,
      default: 'Người giúp việc phù hợp nhất',
    },
    workerId: {
      type: String,
      default: '',
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assigneeType: {
      type: String,
      enum: ['HELPER', 'ENTERPRISE'],
      default: 'HELPER',
    },
    assignedEmployee: {
      id: { type: String, default: '' },
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      avatar: { type: String, default: '' },
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    durationHours: {
      type: Number,
      default: 2,
    },
    startAt: {
      type: Date,
      index: true,
    },
    endAt: {
      type: Date,
      index: true,
    },
    address: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      default: '',
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    pricingSnapshot: {
      basePrice: { type: Number, default: 0 },
      laborTotal: { type: Number, default: 0 },
      advanceFee: { type: Number, default: 0 },
      extraItems: { type: Array, default: [] },
      feeRate: { type: Number, default: 0.2 },
      platformFee: { type: Number, default: 0 },
      helperEarnings: { type: Number, default: 0 },
    },
    notes: {
      type: String,
      default: '',
    },
    dynamicAttributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'UPCOMING',
        'IN_PROGRESS',
        'AWAITING_PAYMENT',
        'COMPLETED',
        'CANCELLED',
        'DISPUTED',
        // Legacy support
        'Chờ người nhận',
        'Sắp diễn ra',
        'Đang thực hiện',
        'Đã hoàn thành',
        'Đã hủy',
      ],
      default: 'PENDING',
      index: true,
    },
    statusColor: {
      type: String,
      default: 'amber',
    },
    acceptedBy: {
      type: String,
      default: '',
    },
    helperPhone: {
      type: String,
      default: '',
    },
    acceptedAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    evidence: {
      type: [String],
      default: [],
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    helperEarnings: {
      type: Number,
      default: 0,
    },
    payoutStatus: {
      type: String,
      enum: ['Chờ quyết toán', 'Đã cộng vào ví', 'Đã thanh toán'],
      default: 'Chờ quyết toán',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentConfirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    dispatchMode: {
      type: String,
      enum: ['MARKET', 'AUTO', 'SPECIFIC'],
      default: 'MARKET',
    },
    invitedWorkerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    inviteExpiresAt: {
      type: Date,
      default: null,
    },
    inviteStatus: {
      type: String,
      enum: ['NONE', 'PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
      default: 'NONE',
    },
    actualGroceryFee: {
      type: Number,
      default: 0,
    },
    groceryReceiptUrls: {
      type: [String],
      default: [],
    },
    noshowReport: {
      reportedBy: { type: String, default: '' },
      role: { type: String, default: '' },
      reason: { type: String, default: '' },
      reportedAt: { type: Date, default: null },
      evidenceUrls: { type: [String], default: [] },
    },
    disputeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispute',
      default: null,
    },
    cancelRequest: {
      status: {
        type: String,
        enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED', 'ADMIN_RESOLVED'],
        default: 'NONE',
      },
      requestedBy: { type: String, default: '' },
      requestedRole: { type: String, default: '' },
      reason: { type: String, default: '' },
      requestedAt: { type: Date, default: null },
      respondedAt: { type: Date, default: null },
      responseNote: { type: String, default: '' },
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

bookingSchema.virtual('id').get(function () {
  return this.bookingCode || this._id.toHexString();
});
bookingSchema.virtual('evidencePhotos').get(function () {
  return this.evidence || [];
});
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;

