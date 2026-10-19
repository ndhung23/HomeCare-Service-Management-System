import Notification from '../models/Notification.js';

export const getMyNotifications = async (req, res) => {
  try {
    const list = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ notifications: list, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải thông báo', error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } });
      return res.json({ success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
    }
    await Notification.findOneAndUpdate({ _id: id, userId: req.user._id }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật thông báo', error: error.message });
  }
};

