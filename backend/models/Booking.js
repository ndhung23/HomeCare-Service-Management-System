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
    service: {
      type: String,
      required: true,
    },
    serviceId: {
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
    address: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      default: 0,
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
      enum: ['Chờ người nhận', 'Sắp diễn ra', 'Đang thực hiện', 'Đã hoàn thành', 'Đã hủy'],
      default: 'Chờ người nhận',
    },
    statusColor: {
      type: String,
      default: 'amber',
    },
  },
  { timestamps: true }
);

bookingSchema.virtual('id').get(function () {
  return this.bookingCode || this._id.toHexString();
});
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;

