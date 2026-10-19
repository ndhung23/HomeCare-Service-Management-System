import Article from '../models/Article.js';

export const getAllNews = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách tin tức', error: error.message });
  }
};

export const createArticle = async (req, res) => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi tạo bài viết', error: error.message });
  }
};

