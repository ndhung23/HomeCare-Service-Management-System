import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    serviceCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    shortDescription: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    bookingCount: {
      type: Number,
      default: 0,
    },
    pricing: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    tags: {
      type: [String],
      default: [],
    },
    iconKey: {
      type: String,
      default: 'Sparkles',
    },
    themeClass: {
      type: String,
      default: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    areas: {
      type: [String],
      default: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    },
    isPackage: {
      type: Boolean,
      default: false,
    },
    bookingFormConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Virtual for id mapping
serviceSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
serviceSchema.set('toJSON', { virtuals: true });
serviceSchema.set('toObject', { virtuals: true });

const Service = mongoose.model('Service', serviceSchema);
export default Service;

