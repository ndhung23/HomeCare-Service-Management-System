import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema(
  {
    disputeCode: {
      type: String,
      required: true,
      unique: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    bookingCode: {
      type: String,
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    creatorName: {
      type: String,
      default: '',
    },
    creatorRole: {
      type: String,
      enum: ['customer', 'helper', 'enterprise'],
      required: true,
    },
    respondentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    evidenceUrls: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_REVIEW', 'RESOLVED'],
      default: 'OPEN',
      index: true,
    },
    resolution: {
      type: String,
      enum: ['NONE', 'DISMISSED', 'PARTIAL_REFUND', 'FULL_REFUND', 'PENALTY'],
      default: 'NONE',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    penaltyAmount: {
      type: Number,
      default: 0,
    },
    frozenAmount: {
      type: Number,
      default: 0,
    },
    adminNote: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

disputeSchema.virtual('id').get(function () {
  return this.disputeCode || this._id.toHexString();
});
disputeSchema.set('toJSON', { virtuals: true });
disputeSchema.set('toObject', { virtuals: true });

const Dispute = mongoose.model('Dispute', disputeSchema);
export default Dispute;

