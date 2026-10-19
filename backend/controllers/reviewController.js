import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';

export const getAllReviews = async (req, res) => {
  try {
    const { workerId, limit = 50 } = req.query;
    let query = {};
    if (workerId) {
      query.workerId = workerId;
    }
    const reviews = await Review.find(query).sort({ createdAt: -1 }).limit(Number(limit));
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đánh giá', error: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const user = req.user;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Vui lòng cung cấp số sao đánh giá (1-5) và nhận xét' });
    }

    let booking = null;
    if (bookingId) {
      booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ tương ứng' });
      }

      if (booking.status !== 'COMPLETED') {
        return res.status(400).json({ message: 'Chỉ có thể đánh giá sau khi ca làm việc đã hoàn thành và thanh toán xong!' });
      }

      if (booking.isReviewed) {
        return res.status(400).json({ message: 'Đơn dịch vụ này đã được bạn đánh giá trước đó!' });
      }

      booking.isReviewed = true;
      await booking.save();
    }

    const newReview = await Review.create({
      author: user?.name || req.body.author || 'Khách hàng',
      avatar: user?.avatar || req.body.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      date: 'Hôm nay',
      service: booking?.service || req.body.service || 'Dịch vụ gia đình',
      helper: booking?.helper || req.body.helper || '',
      rating: Number(rating),
      comment,
      bookingId: booking?._id || null,
      customerId: user?._id || null,
      workerId: booking?.assigneeId?.toString() || booking?.workerId || req.body.workerId || '',
    });

    // Cập nhật rating trung bình cho Worker nếu có
    const targetWorkerId = booking?.assigneeId || booking?.workerId;
    if (targetWorkerId) {
      const worker = await Worker.findOne({
        $or: [{ userId: targetWorkerId }, { code: targetWorkerId }, { _id: targetWorkerId }],
      });
      if (worker) {
        const allWorkerReviews = await Review.find({
          workerId: { $in: [targetWorkerId.toString(), worker.code, worker._id.toString()] },
        });
        const count = allWorkerReviews.length;
        const avg = allWorkerReviews.reduce((sum, r) => sum + r.rating, 0) / count;
        worker.rating = Math.round(avg * 10) / 10;
        worker.reviewsCount = count;
        await worker.save();
      }
    }

    res.status(201).json({ success: true, message: 'Cảm ơn bạn đã gửi đánh giá dịch vụ!', review: newReview });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(400).json({ message: 'Lỗi khi tạo đánh giá', error: error.message });
  }
};
