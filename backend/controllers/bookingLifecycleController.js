import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import { assertTransition } from '../services/bookingStateMachine.js';
import { getFileUrl } from '../middleware/uploadMiddleware.js';

// Kiểm tra trùng lịch có đệm 30 phút (Role.md Mục 8.7)
export const checkScheduleConflict = async (userId, employeeId, startAt, endAt, excludeBookingId = null) => {
  if (!startAt || !endAt) return null;

  const bufferMs = 30 * 60 * 1000;
  const bufferedStart = new Date(new Date(startAt).getTime() - bufferMs);
  const bufferedEnd = new Date(new Date(endAt).getTime() + bufferMs);

  const query = {
    status: { $in: ['UPCOMING', 'IN_PROGRESS'] },
    startAt: { $lt: bufferedEnd },
    endAt: { $gt: bufferedStart },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  if (employeeId) {
    query['assignedEmployee.id'] = employeeId;
  } else {
    query.assigneeId = userId;
  }

  return await Booking.findOne(query);
};

// Nhận ca nguyên tử từ Chợ việc làm (Role.md 8.7)
export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!['helper', 'enterprise', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Chỉ Người giúp việc hoặc Doanh nghiệp mới có thể nhận ca' });
    }

    if (user.role !== 'admin' && (user.kycLevel || 1) < 2) {
      return res.status(403).json({
        message: 'Tài khoản Cấp 1 cần chờ Admin xác thực hồ sơ CCCD để bắt đầu nhận việc',
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({
        message: 'Ca làm việc này đã có người nhận hoặc không còn ở trạng thái chờ!',
      });
    }

    let assignedEmployee = { id: '', name: '', phone: '', avatar: '' };
    let workerDisplayName = user.name;
    let workerPhone = user.phone || '';

    if (user.role === 'enterprise') {
      const empId = req.body.employeeId;
      const employee = (user.employees || []).find((e) => e.id === empId);
      if (!employee) {
        return res.status(400).json({ message: 'Doanh nghiệp bắt buộc phải chọn 1 nhân viên phụ trách ca' });
      }
      assignedEmployee = {
        id: employee.id,
        name: employee.name,
        phone: employee.phone || user.phone || '',
        avatar: employee.avatar || '',
      };
      workerDisplayName = `${user.name} (NV: ${employee.name})`;
      workerPhone = employee.phone || user.phone || '';

      const conflict = await checkScheduleConflict(user._id, employee.id, booking.startAt, booking.endAt, booking._id);
      if (conflict) {
        return res.status(400).json({
          message: `Nhân viên ${employee.name} đã có ca làm việc khác trong khung giờ này (yêu cầu giãn cách 30 phút)!`,
        });
      }
    } else {
      const conflict = await checkScheduleConflict(user._id, null, booking.startAt, booking.endAt, booking._id);
      if (conflict) {
        return res.status(400).json({
          message: 'Bạn đã có ca làm việc khác trùng khung giờ (yêu cầu giãn cách tối thiểu 30 phút để di chuyển)!',
        });
      }
    }

    const feeRate = user.role === 'enterprise' ? 0.12 : 0.20;
    const laborTotal = booking.pricingSnapshot?.laborTotal || booking.totalPrice || 0;
    const advanceFee = booking.pricingSnapshot?.advanceFee || 0;
    const platformFee = Math.round(laborTotal * feeRate);
    const helperEarnings = (laborTotal - platformFee) + advanceFee;

    // Nguyên tử: chỉ update nếu status vẫn là PENDING
    const updated = await Booking.findOneAndUpdate(
      { _id: booking._id, status: 'PENDING' },
      {
        $set: {
          status: 'UPCOMING',
          statusColor: 'blue',
          assigneeId: user._id,
          assigneeType: user.role === 'enterprise' ? 'ENTERPRISE' : 'HELPER',
          assignedEmployee,
          helper: workerDisplayName,
          helperPhone: workerPhone,
          acceptedBy: user._id.toString(),
          acceptedAt: new Date(),
          platformFee,
          helperEarnings,
          'pricingSnapshot.feeRate': feeRate,
          'pricingSnapshot.platformFee': platformFee,
          'pricingSnapshot.helperEarnings': helperEarnings,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({
        message: 'Rất tiếc! Ca làm việc này vừa được người khác nhận trước một tích tắc.',
      });
    }

    // Gửi thông báo cho khách
    if (updated.customerId) {
      await Notification.create({
        userId: updated.customerId,
        title: 'Đơn dịch vụ đã có người nhận!',
        message: `${workerDisplayName} đã nhận ca của bạn (${updated.service} vào ngày ${updated.date}).`,
        type: 'BOOKING',
        link: '/customer',
      }).catch(() => {});
    }

    res.json({
      success: true,
      message: 'Nhận ca thành công! Vui lòng chuẩn bị và có mặt đúng giờ.',
      booking: updated,
    });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({ message: 'Lỗi khi nhận ca làm việc', error: error.message });
  }
};

// Bắt đầu làm việc (Role.md 8.4)
export const startBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ' });
    }

    if (
      req.user.role !== 'admin' &&
      booking.assigneeId?.toString() !== req.user._id?.toString()
    ) {
      return res.status(403).json({ message: 'Bạn không phải người được giao phụ trách ca này' });
    }

    assertTransition(booking.status, 'IN_PROGRESS', req.user.role);

    booking.status = 'IN_PROGRESS';
    booking.statusColor = 'indigo';
    booking.startedAt = new Date();

    const saved = await booking.save();

    if (booking.customerId) {
      await Notification.create({
        userId: booking.customerId,
        title: 'Người giúp việc đã bắt đầu ca!',
        message: `${booking.helper} đã có mặt và bắt đầu thực hiện ca làm việc ${booking.bookingCode}.`,
        type: 'BOOKING',
        link: '/customer',
      }).catch(() => {});
    }

    res.json({ success: true, message: 'Đã bắt đầu ca làm việc!', booking: saved });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Hoàn thành ca + upload ảnh bằng chứng (Role.md 8.8)
export const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ' });
    }

    if (
      req.user.role !== 'admin' &&
      booking.assigneeId?.toString() !== req.user._id?.toString()
    ) {
      return res.status(403).json({ message: 'Bạn không phải người phụ trách ca này' });
    }

    assertTransition(booking.status, 'AWAITING_PAYMENT', req.user.role);

    // Thu thập ảnh bằng chứng từ file upload hoặc body
    let evidenceUrls = [];
    if (req.files && req.files.length > 0) {
      evidenceUrls = req.files.map((file) => getFileUrl(req, file));
    } else if (req.body.evidence) {
      evidenceUrls = Array.isArray(req.body.evidence) ? req.body.evidence : [req.body.evidence];
    }

    // Role.md 8.8: Bắt buộc tối thiểu 1 ảnh bằng chứng
    if (evidenceUrls.length === 0 && (!booking.evidence || booking.evidence.length === 0)) {
      return res.status(400).json({
        message: 'Bắt buộc tải lên tối thiểu 1 ảnh/video bằng chứng hoàn thành ca làm việc!',
      });
    }

    booking.status = 'AWAITING_PAYMENT';
    booking.statusColor = 'amber';
    booking.completedAt = new Date();
    booking.payoutStatus = 'Chờ quyết toán';
    if (evidenceUrls.length > 0) {
      booking.evidence = [...(booking.evidence || []), ...evidenceUrls];
    }

    const saved = await booking.save();

    if (booking.customerId) {
      await Notification.create({
        userId: booking.customerId,
        title: 'Ca làm việc đã hoàn thành - Chờ thanh toán',
        message: `${booking.helper} đã hoàn thành ca ${booking.bookingCode}. Vui lòng kiểm tra bằng chứng và quét mã QR thanh toán.`,
        type: 'PAYMENT',
        link: '/customer',
      }).catch(() => {});
    }

    res.json({
      success: true,
      message: 'Ca làm việc đã hoàn tất! Đơn chuyển sang trạng thái Chờ thanh toán.',
      booking: saved,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Hủy đơn / Yêu cầu hủy đơn (Role.md 8.5)
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;
    const user = req.user;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ' });
    }

    // 1. Nếu đơn PENDING: Khách hoặc Admin hủy ngay lập tức, miễn phí
    if (booking.status === 'PENDING') {
      if (user.role !== 'admin' && booking.customerEmail !== user.email && booking.customerId?.toString() !== user._id?.toString()) {
        return res.status(403).json({ message: 'Bạn không có quyền hủy đơn này' });
      }
      booking.status = 'CANCELLED';
      booking.statusColor = 'rose';
      booking.notes = (booking.notes ? booking.notes + ' | ' : '') + `Khách hủy đơn: ${reason || 'Không có lý do'}`;
      const saved = await booking.save();
      return res.json({ success: true, message: 'Đã hủy đơn dịch vụ thành công (miễn phí).', booking: saved });
    }

    // 2. Nếu đơn UPCOMING (đã có người nhận): Cần cả hai bên xác nhận (Role.md 8.5)
    if (booking.status === 'UPCOMING') {
      // Admin được quyền cưỡng chế hủy
      if (user.role === 'admin') {
        booking.status = 'CANCELLED';
        booking.statusColor = 'rose';
        booking.notes = (booking.notes ? booking.notes + ' | ' : '') + `Admin hủy: ${reason}`;
        const saved = await booking.save();
        return res.json({ success: true, message: 'Admin đã hủy đơn thành công.', booking: saved });
      }

      const isCustomer = booking.customerEmail === user.email || booking.customerId?.toString() === user._id?.toString();
      const isAssignee = booking.assigneeId?.toString() === user._id?.toString();

      if (!isCustomer && !isAssignee) {
        return res.status(403).json({ message: 'Bạn không thuộc đơn dịch vụ này' });
      }

      // Nếu đã có yêu cầu hủy từ bên kia -> Xác nhận hủy thành công
      if (booking.cancelRequest && booking.cancelRequest.requestedBy && booking.cancelRequest.requestedRole !== user.role) {
        booking.status = 'CANCELLED';
        booking.statusColor = 'rose';
        booking.cancelRequest = {
          requestedBy: booking.cancelRequest.requestedBy,
          requestedRole: booking.cancelRequest.requestedRole,
          reason: `${booking.cancelRequest.reason} (Đã được ${user.name} xác nhận hủy)`,
          requestedAt: new Date(),
        };
        const saved = await booking.save();

        // Gửi thông báo cho cả 2 bên
        return res.json({
          success: true,
          message: 'Hai bên đã đồng thuận xác nhận hủy đơn. Đơn đã được hủy miễn phí.',
          booking: saved,
        });
      }

      // Chưa có yêu cầu hủy -> Tạo yêu cầu hủy và gửi cho bên kia
      booking.cancelRequest = {
        requestedBy: user.name,
        requestedRole: user.role,
        reason: reason || 'Yêu cầu hủy từ người dùng',
        requestedAt: new Date(),
      };
      const saved = await booking.save();

      const notifyTargetId = isCustomer ? booking.assigneeId : booking.customerId;
      if (notifyTargetId) {
        await Notification.create({
          userId: notifyTargetId,
          title: 'Yêu cầu hủy đơn ca làm việc',
          message: `${user.name} đã gửi yêu cầu hủy đơn ${booking.bookingCode}. Vui lòng bấm xác nhận nếu đồng thuận.`,
          type: 'BOOKING',
          link: isCustomer ? '/helper' : '/customer',
        }).catch(() => {});
      }

      return res.json({
        success: true,
        message: 'Đã gửi yêu cầu hủy đơn. Đơn sẽ chính thức hủy sau khi bên còn lại xác nhận.',
        booking: saved,
      });
    }

    return res.status(400).json({
      message: `Đơn đang ở trạng thái "${booking.status}", không thể thực hiện thao tác hủy!`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xử lý hủy đơn', error: error.message });
  }
};

