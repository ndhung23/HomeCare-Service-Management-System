import Dispute from '../models/Dispute.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Notification from '../models/Notification.js';

export const createDispute = async (req, res) => {
  try {
    const { bookingId, reason, description, evidenceUrls = [] } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!bookingId || !reason || !description) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã đơn, lý do và mô tả chi tiết khiếu nại' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin đơn đặt dịch vụ' });
    }

    // Check authorization: must be customer or assignee
    const isCustomer = booking.customerId && booking.customerId.toString() === userId;
    const isAssignee = booking.assigneeId && booking.assigneeId.toString() === userId;

    if (!isCustomer && !isAssignee && userRole !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền khiếu nại đơn này' });
    }

    // Check 24-hour window from completedAt if job was completed
    if (booking.completedAt) {
      const hoursSinceCompleted = (Date.now() - new Date(booking.completedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceCompleted > 24) {
        return res.status(400).json({ message: 'Thời hạn khiếu nại (24 giờ kể từ khi hoàn thành ca) đã hết' });
      }
    }

    // Check existing active dispute
    const existingDispute = await Dispute.findOne({
      bookingId: booking._id,
      status: { $in: ['OPEN', 'IN_REVIEW'] },
    });
    if (existingDispute) {
      return res.status(400).json({ message: 'Đơn này đang có một khiếu nại đang được xử lý' });
    }

    const disputeCode = `KN-${Date.now().toString().slice(-6)}`;
    const respondentId = isCustomer ? booking.assigneeId : booking.customerId;

    let frozenAmount = 0;
    // If completed and worker received earnings, freeze worker's wallet earnings
    if (booking.status === 'COMPLETED' && booking.assigneeId) {
      frozenAmount = Number(booking.helperEarnings) || 0;
      if (frozenAmount > 0) {
        const workerUser = await User.findById(booking.assigneeId);
        if (workerUser) {
          if (!workerUser.wallet) workerUser.wallet = { available: 0, locked: 0 };
          workerUser.wallet.available = Math.max(0, workerUser.wallet.available - frozenAmount);
          workerUser.wallet.locked = (workerUser.wallet.locked || 0) + frozenAmount;
          await workerUser.save();

          await WalletTransaction.create({
            userId: workerUser._id,
            type: 'HOLD',
            amount: frozenAmount,
            bookingId: booking._id,
            bookingCode: booking.bookingCode,
            balanceAfter: workerUser.wallet.available,
            note: `Tạm đóng băng thu nhập ca #${booking.bookingCode} do có khiếu nại (${disputeCode})`,
          });
        }
      }
    }

    const dispute = await Dispute.create({
      disputeCode,
      bookingId: booking._id,
      bookingCode: booking.bookingCode,
      creatorId: userId,
      creatorName: req.user.name || 'Người dùng',
      creatorRole: userRole,
      respondentId,
      reason,
      description,
      evidenceUrls,
      frozenAmount,
      status: 'OPEN',
    });

    booking.status = 'DISPUTED';
    booking.disputeId = dispute._id;
    await booking.save();

    // Notify respondent
    if (respondentId) {
      await Notification.create({
        userId: respondentId,
        title: 'Có khiếu nại mới',
        message: `Đơn #${booking.bookingCode} đã bị khiếu nại: "${reason}". Admin sẽ can thiệp và xử lý.`,
        type: 'WARNING',
        metadata: { bookingId: booking._id, disputeId: dispute._id },
      });
    }

    return res.status(201).json({
      message: 'Gửi khiếu nại thành công. Đơn hàng đã chuyển sang trạng thái tranh chấp và chờ Admin phân xử.',
      dispute,
    });
  } catch (error) {
    console.error('Error in createDispute:', error);
    return res.status(500).json({ message: 'Lỗi server khi tạo khiếu nại', error: error.message });
  }
};

export const getDisputes = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let query = {};

    if (userRole !== 'admin') {
      query = {
        $or: [{ creatorId: userId }, { respondentId: userId }],
      };
    }

    const disputes = await Dispute.find(query)
      .populate('bookingId')
      .populate('creatorId', 'name email phone role')
      .populate('respondentId', 'name email phone role')
      .sort({ createdAt: -1 });

    return res.status(200).json({ disputes });
  } catch (error) {
    console.error('Error in getDisputes:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy danh sách khiếu nại', error: error.message });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, refundAmount = 0, penaltyAmount = 0, adminNote = '' } = req.body;
    const adminId = req.user.id;

    if (!['DISMISSED', 'PARTIAL_REFUND', 'FULL_REFUND', 'PENALTY'].includes(resolution)) {
      return res.status(400).json({ message: 'Quyết định phân xử không hợp lệ' });
    }

    const dispute = await Dispute.findById(id).populate('bookingId');
    if (!dispute) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin khiếu nại' });
    }

    if (dispute.status === 'RESOLVED') {
      return res.status(400).json({ message: 'Khiếu nại này đã được phân xử trước đó' });
    }

    const booking = dispute.bookingId;
    const frozen = dispute.frozenAmount || 0;
    const workerId = booking?.assigneeId;

    if (workerId && frozen > 0) {
      const worker = await User.findById(workerId);
      if (worker) {
        if (!worker.wallet) worker.wallet = { available: 0, locked: 0 };

        if (resolution === 'DISMISSED') {
          // Bác khiếu nại: giải phóng toàn bộ tiền đóng băng về ví khả dụng của Helper
          worker.wallet.locked = Math.max(0, worker.wallet.locked - frozen);
          worker.wallet.available += frozen;
          await worker.save();

          await WalletTransaction.create({
            userId: worker._id,
            type: 'RELEASE',
            amount: frozen,
            bookingId: booking._id,
            bookingCode: booking.bookingCode,
            balanceAfter: worker.wallet.available,
            note: `Admin bác khiếu nại (${dispute.disputeCode}), giải phóng thu nhập ca #${booking.bookingCode}`,
          });
        } else if (resolution === 'FULL_REFUND') {
          // Hoàn toàn phần cho khách: khấu trừ toàn bộ tiền đóng băng của thợ
          worker.wallet.locked = Math.max(0, worker.wallet.locked - frozen);
          await worker.save();

          await WalletTransaction.create({
            userId: worker._id,
            type: 'PENALTY',
            amount: frozen,
            bookingId: booking._id,
            bookingCode: booking.bookingCode,
            balanceAfter: worker.wallet.available,
            note: `Khấu trừ thu nhập do hoàn tiền toàn phần cho khách ca #${booking.bookingCode} (${dispute.disputeCode})`,
          });
        } else if (resolution === 'PARTIAL_REFUND') {
          // Hoàn một phần: trừ tiền hoàn, phần dư trả lại cho thợ
          const actualRefund = Math.min(frozen, Number(refundAmount) || 0);
          const remainder = frozen - actualRefund;

          worker.wallet.locked = Math.max(0, worker.wallet.locked - frozen);
          if (remainder > 0) {
            worker.wallet.available += remainder;
          }
          await worker.save();

          if (actualRefund > 0) {
            await WalletTransaction.create({
              userId: worker._id,
              type: 'PENALTY',
              amount: actualRefund,
              bookingId: booking._id,
              bookingCode: booking.bookingCode,
              balanceAfter: worker.wallet.available,
              note: `Khấu trừ hoàn tiền một phần cho khách ca #${booking.bookingCode} (${dispute.disputeCode})`,
            });
          }
          if (remainder > 0) {
            await WalletTransaction.create({
              userId: worker._id,
              type: 'RELEASE',
              amount: remainder,
              bookingId: booking._id,
              bookingCode: booking.bookingCode,
              balanceAfter: worker.wallet.available,
              note: `Giải phóng phần thu nhập còn lại sau hoàn tiền ca #${booking.bookingCode}`,
            });
          }
        } else if (resolution === 'PENALTY') {
          // Phạt: trừ khoản tiền phạt
          const penalty = Number(penaltyAmount) || frozen;
          worker.wallet.locked = Math.max(0, worker.wallet.locked - frozen);
          worker.wallet.available = Math.max(0, worker.wallet.available - penalty);
          await worker.save();

          await WalletTransaction.create({
            userId: worker._id,
            type: 'PENALTY',
            amount: penalty,
            bookingId: booking._id,
            bookingCode: booking.bookingCode,
            balanceAfter: worker.wallet.available,
            note: `Phạt vi phạm quy định sàn ca #${booking.bookingCode} (${dispute.disputeCode})`,
          });
        }
      }
    }

    dispute.status = 'RESOLVED';
    dispute.resolution = resolution;
    dispute.refundAmount = Number(refundAmount) || 0;
    dispute.penaltyAmount = Number(penaltyAmount) || 0;
    dispute.adminNote = adminNote;
    dispute.resolvedBy = adminId;
    dispute.resolvedAt = new Date();
    await dispute.save();

    if (booking) {
      booking.status = 'COMPLETED';
      await booking.save();
    }

    // Notify parties
    const notifyUsers = [dispute.creatorId, dispute.respondentId].filter(Boolean);
    for (const uId of notifyUsers) {
      await Notification.create({
        userId: uId,
        title: 'Khiếu nại đã được giải quyết',
        message: `Admin đã xử lý khiếu nại #${dispute.disputeCode} (${resolution}). Ghi chú: ${adminNote || 'Không có'}`,
        type: 'INFO',
        metadata: { bookingId: booking?._id, disputeId: dispute._id },
      });
    }

    return res.status(200).json({
      message: 'Đã phân xử và giải quyết khiếu nại thành công',
      dispute,
    });
  } catch (error) {
    console.error('Error in resolveDispute:', error);
    return res.status(500).json({ message: 'Lỗi server khi giải quyết khiếu nại', error: error.message });
  }
};

