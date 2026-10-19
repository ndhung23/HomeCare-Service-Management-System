import mongoose from 'mongoose';

const contentItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['FAQ', 'NEWS', 'POLICY'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'Chung',
    },
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

contentItemSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
contentItemSchema.set('toJSON', { virtuals: true });
contentItemSchema.set('toObject', { virtuals: true });

const ContentItem = mongoose.model('ContentItem', contentItemSchema);
export default ContentItem;

