import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'Mẹo vặt gia đình',
    },
    date: {
      type: String,
      default: '',
    },
    readTime: {
      type: String,
      default: '3 phút đọc',
    },
    image: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Article = mongoose.model('Article', articleSchema);
export default Article;

