import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    },
    role: {
      type: String,
      default: 'Giúp việc gia đình',
    },
    experience: {
      type: String,
      default: 'Kinh nghiệm: 3 năm',
    },
    experienceYears: {
      type: Number,
      default: 3,
    },
    area: {
      type: String,
      default: 'Hà Nội',
    },
    district: {
      type: String,
      default: 'Cầu Giấy',
    },
    skills: {
      type: [String],
      default: ['Dọn dẹp', 'Nấu ăn'],
    },
    hourlyRate: {
      type: Number,
      default: 120000,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    jobsDone: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

workerSchema.virtual('id').get(function () {
  return this.code || this._id.toHexString();
});
workerSchema.set('toJSON', { virtuals: true });
workerSchema.set('toObject', { virtuals: true });

const Worker = mongoose.model('Worker', workerSchema);
export default Worker;

