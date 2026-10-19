import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';

export const getAllReviews = async (req, res) => {
  try {
    const { workerId, limit = 50, includeHidden } = req.query;
    let query = {};
    if (workerId) {
      query.workerId = workerId;
    }
    // Chỉ Admin mới được xem các review bị ẩn
    if (!includeHidden || req.user?.role !== 'admin') {
      query.isHidden = { $ne: true };
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
          isHidden: { $ne: true },
        });
        const count = allWorkerReviews.length;
        const avg = count > 0 ? allWorkerReviews.reduce((sum, r) => sum + r.rating, 0) / count : 5.0;
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

// Sửa đánh giá trong vòng 7 ngày (Role.md 3.1.g & Mục 14)
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user = req.user;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    if (review.customerId?.toString() !== user._id?.toString() && user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền sửa đánh giá này' });
    }

    // Kiểm tra thời hạn 7 ngày
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - new Date(review.createdAt).getTime() > sevenDaysMs && user.role !== 'admin') {
      return res.status(400).json({ message: 'Thời hạn chỉnh sửa đánh giá (7 ngày kể từ lúc gửi) đã kết thúc' });
    }

    if (rating) review.rating = Number(rating);
    if (comment) review.comment = comment;
    await review.save();

    // Tính lại rating trung bình
    if (review.workerId) {
      const worker = await Worker.findOne({
        $or: [{ userId: review.workerId }, { code: review.workerId }, { _id: review.workerId }],
      });
      if (worker) {
        const allWorkerReviews = await Review.find({
          workerId: { $in: [review.workerId, worker.code, worker._id.toString()] },
          isHidden: { $ne: true },
        });
        const count = allWorkerReviews.length;
        const avg = count > 0 ? allWorkerReviews.reduce((sum, r) => sum + r.rating, 0) / count : 5.0;
        worker.rating = Math.round(avg * 10) / 10;
        worker.reviewsCount = count;
        await worker.save();
      }
    }

    res.json({ success: true, message: 'Đã cập nhật đánh giá thành công!', review });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi sửa đánh giá', error: error.message });
  }
};

// Admin ẩn/hiện đánh giá (Role.md 2.1.d)
export const toggleReviewVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    review.isHidden = !review.isHidden;
    if (review.isHidden) {
      review.hiddenReason = reason || 'Admin ẩn do vi phạm tiêu chuẩn cộng đồng';
    } else {
      review.hiddenReason = '';
    }
    await review.save();

    // Tính lại rating trung bình cho Worker (không tính review bị ẩn)
    if (review.workerId) {
      const worker = await Worker.findOne({
        $or: [{ userId: review.workerId }, { code: review.workerId }, { _id: review.workerId }],
      });
      if (worker) {
        const activeReviews = await Review.find({
          workerId: { $in: [review.workerId, worker.code, worker._id.toString()] },
          isHidden: { $ne: true },
        });
        const count = activeReviews.length;
        const avg = count > 0 ? activeReviews.reduce((sum, r) => sum + r.rating, 0) / count : 5.0;
        worker.rating = Math.round(avg * 10) / 10;
        worker.reviewsCount = count;
        await worker.save();
      }
    }

    res.json({
      success: true,
      message: review.isHidden ? 'Đã ẩn đánh giá khỏi giao diện' : 'Đã bỏ ẩn đánh giá',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thay đổi trạng thái đánh giá', error: error.message });
  }
};
