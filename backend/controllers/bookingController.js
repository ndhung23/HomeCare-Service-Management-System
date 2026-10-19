import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Notification from '../models/Notification.js';
import { calculateBookingPrice } from '../services/pricingService.js';
import mongoose from 'mongoose';

// Map status sang mã màu hiển thị
export const getStatusColor = (status) => {
  switch (status) {
    case 'COMPLETED':
    case 'Đã hoàn thành':
      return 'emerald';
    case 'UPCOMING':
    case 'Sắp diễn ra':
      return 'blue';
    case 'IN_PROGRESS':
    case 'Đang thực hiện':
      return 'indigo';
    case 'AWAITING_PAYMENT':
      return 'amber';
    case 'CANCELLED':
    case 'Đã hủy':
      return 'rose';
    case 'DISPUTED':
      return 'purple';
    case 'PENDING':
    case 'Chờ người nhận':
    default:
      return 'amber';
  }
};

// Tạo mới đơn đặt dịch vụ (Role.md 3.1 & Flow 2)
export const createBooking = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập để đặt dịch vụ' });
    }

    const {
      serviceId,
      serviceCode,
      serviceTitle,
      date,
      time,
      durationHours,
      address,
      notes = '',
      dynamicAttributes = {},
      helperName,
      workerId,
      dispatchMode = 'MARKET',
    } = req.body;

    if (!date || !time || !address) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ ngày, giờ và địa chỉ làm việc' });
    }

    // 1. Kiểm tra Lead time tối thiểu 2 giờ (Role.md Mục 3.1 & 14)
    const rawDate = req.body.workDate || date;
    let isoDate = rawDate;
    if (typeof rawDate === 'string' && rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    const rawTime = req.body.startTime || (typeof time === 'string' ? time.split(' ')[0] : '08:00');
    const startAt = new Date(`${isoDate}T${rawTime}:00`);

    if (isNaN(startAt.getTime())) {
      return res.status(400).json({ message: 'Định dạng ngày hoặc giờ không hợp lệ' });
    }

    const minLeadMs = 2 * 60 * 60 * 1000;
    if (startAt.getTime() < Date.now() + minLeadMs - 5 * 60 * 1000) { // du di 5 phút
      return res.status(400).json({
        message: 'Thời gian bắt đầu ca phải cách thời điểm hiện tại tối thiểu 2 giờ!',
      });
    }

    const duration = Number(durationHours) || 2;
    const endAt = new Date(startAt.getTime() + duration * 60 * 60 * 1000);

    // 2. Tính toán giá chính xác ở phía Backend (Snapshot giá)
    const pricing = await calculateBookingPrice(serviceId || serviceCode, {
      durationHours: duration,
      dynamicAttributes,
      assigneeRole: 'helper',
    });

    const bookingCode = `BK-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;

    // 3. Xử lý hình thức điều phối: SPECIFIC, AUTO, hoặc MARKET (Role.md Flow 2)
    let selectedMode = dispatchMode;
    let invitedWorkerId = null;
    let inviteExpiresAt = null;
    let inviteStatus = 'NONE';
    let targetWorkerName = helperName || 'Người giúp việc phù hợp nhất';

    if (workerId || dispatchMode === 'SPECIFIC') {
      selectedMode = 'SPECIFIC';
      let targetUser = null;
      if (mongoose.Types.ObjectId.isValid(workerId)) {
        targetUser = await User.findById(workerId);
      }
      if (!targetUser) {
        const workerDoc = await Worker.findOne({ $or: [{ id: workerId }, { workerId }] });
        if (workerDoc?.userId) {
          targetUser = await User.findById(workerDoc.userId);
        }
      }

      if (targetUser) {
        invitedWorkerId = targetUser._id;
        inviteStatus = 'PENDING';
        // Hạn mời = min(5 giờ, thời gian còn lại đến giờ bắt đầu - 30 phút)
        const fiveHoursMs = 5 * 60 * 60 * 1000;
        const timeUntilJobMs = startAt.getTime() - 30 * 60 * 1000 - Date.now();
        inviteExpiresAt = new Date(Date.now() + Math.min(fiveHoursMs, Math.max(10 * 60 * 1000, timeUntilJobMs)));
        targetWorkerName = targetUser.name;
      }
    } else if (dispatchMode === 'AUTO') {
      // Tìm 1 Helper C2 đang bật Sẵn sàng, điểm đánh giá cao
      const candidate = await User.findOne({
        role: 'helper',
        kycLevel: 2,
        status: 'ACTIVE',
        isAvailableForJobs: { $ne: false },
        $or: [{ jobClaimLockedUntil: null }, { jobClaimLockedUntil: { $lt: new Date() } }],
      });

      if (candidate) {
        invitedWorkerId = candidate._id;
        selectedMode = 'AUTO';
        inviteStatus = 'PENDING';
        inviteExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút ưu tiên
        targetWorkerName = candidate.name;
      } else {
        selectedMode = 'MARKET'; // Không tìm thấy ứng viên phù hợp -> đẩy lên Chợ
      }
    }

    const newBooking = await Booking.create({
      bookingCode,
      customerId: user._id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone || req.body.customerPhone || '',
      service: pricing.serviceTitle,
      serviceId: pricing.serviceId,
      serviceCode: pricing.serviceCode,
      preferredHelperId: workerId || '',
      helper: targetWorkerName,
      workerId: workerId || '',
      dispatchMode: selectedMode,
      invitedWorkerId,
      inviteExpiresAt,
      inviteStatus,
      date,
      time,
      durationHours: duration,
      startAt,
      endAt,
      address,
      price: pricing.formattedTotalPrice,
      totalPrice: pricing.totalPrice,
      pricingSnapshot: {
        basePrice: pricing.basePrice,
        laborTotal: pricing.laborTotal,
        advanceFee: pricing.advanceFee,
        extraItems: pricing.extraItems,
        feeRate: pricing.feeRate,
        platformFee: pricing.platformFee,
        helperEarnings: pricing.helperEarnings,
      },
      notes,
      dynamicAttributes,
      status: 'PENDING',
      statusColor: 'amber',
    });

    // Gửi thông báo cho người được mời đích danh / AUTO
    if (invitedWorkerId) {
      await Notification.create({
        userId: invitedWorkerId,
        title: selectedMode === 'SPECIFIC' ? 'Lời mời nhận ca đích danh!' : 'Lời mời nhận ca ưu tiên (AUTO)!',
        message: `Khách hàng ${user.name} đã gửi lời mời bạn nhận ca #${bookingCode} (${pricing.serviceTitle}).`,
        type: 'BOOKING',
        link: '/helper',
      }).catch(() => {});
    }

    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({ message: 'Lỗi khi tạo đơn đặt dịch vụ', error: error.message });
  }
};

// Chợ việc làm mới: Danh sách đơn PENDING (Role.md 1.2 & Flow 2)
export const getMarketBookings = async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();

    const query = {
      status: { $in: ['PENDING', 'Chờ người nhận'] },
      $or: [
        { dispatchMode: { $in: ['MARKET', null] } },
        { dispatchMode: { $exists: false } },
        { inviteStatus: 'REJECTED' },
        { inviteExpiresAt: { $lt: now } },
      ],
    };

    if (user) {
      query.$or.push({ invitedWorkerId: user._id });
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    // Ẩn số nhà cụ thể và SĐT khách trên Chợ việc làm (Role.md 1.2)
    const sanitized = bookings.map((b) => {
      const parts = (b.address || '').split(',').map((s) => s.trim());
      const maskedAddress = parts.length > 2 ? parts.slice(-2).join(', ') : b.address;
      const isInvitedToMe = Boolean(user && b.invitedWorkerId && b.invitedWorkerId.toString() === user._id.toString());

      return {
        _id: b._id,
        id: b.id,
        bookingCode: b.bookingCode,
        service: b.service,
        serviceCode: b.serviceCode,
        date: b.date,
        time: b.time,
        durationHours: b.durationHours,
        maskedAddress,
        notes: b.notes,
        totalPrice: b.totalPrice,
        price: b.price,
        helperEarnings: b.pricingSnapshot?.helperEarnings || Math.round(b.totalPrice * 0.8),
        advanceFee: b.pricingSnapshot?.advanceFee || 0,
        dynamicAttributes: b.dynamicAttributes,
        dispatchMode: b.dispatchMode,
        invitedWorkerId: b.invitedWorkerId,
        inviteStatus: b.inviteStatus,
        inviteExpiresAt: b.inviteExpiresAt,
        isInvitedToMe,
        createdAt: b.createdAt,
      };
    });

    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tải danh sách ca trên Chợ việc làm', error: error.message });
  }
};

// Lấy danh sách đơn theo vai trò người dùng
export const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const user = req.user;
    let query = {};

    if (user && user.role === 'customer') {
      query.$or = [{ customerId: user._id }, { customerEmail: user.email.toLowerCase() }];
    } else if (user && (user.role === 'helper' || user.role === 'enterprise')) {
      query.$or = [{ assigneeId: user._id }, { workerId: user._id.toString() }, { acceptedBy: user._id.toString() }];
    }
    // Admin lấy toàn bộ

    if (status) {
      if (status === 'PENDING') {
        query.status = { $in: ['PENDING', 'Chờ người nhận'] };
      } else if (status === 'UPCOMING') {
        query.status = { $in: ['UPCOMING', 'Sắp diễn ra'] };
      } else if (status === 'IN_PROGRESS') {
        query.status = { $in: ['IN_PROGRESS', 'Đang thực hiện'] };
      } else if (status === 'AWAITING_PAYMENT') {
        query.status = 'AWAITING_PAYMENT';
      } else if (status === 'COMPLETED') {
        query.status = { $in: ['COMPLETED', 'Đã hoàn thành'] };
      } else if (status === 'CANCELLED') {
        query.status = { $in: ['CANCELLED', 'Đã hủy'] };
      } else {
        query.status = status;
      }
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn dịch vụ', error: error.message });
  }
};

// Chi tiết đơn
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    let booking = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      booking = await Booking.findById(id);
    }
    if (!booking) {
      booking = await Booking.findOne({ bookingCode: id });
    }

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thống kê chi tiêu khách hàng (Role.md 3.1.h)
export const getMySpending = async (req, res) => {
  try {
    const userId = req.user._id;
    const completedBookings = await Booking.find({
      $or: [{ customerId: userId }, { customerEmail: req.user.email.toLowerCase() }],
      status: { $in: ['COMPLETED', 'Đã hoàn thành'] },
    }).sort({ completedAt: -1, createdAt: -1 });

    const totalSpent = completedBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
    const completedCount = completedBookings.length;

    // Phân bổ theo dịch vụ
    const byService = {};
    completedBookings.forEach((b) => {
      const sName = b.service || 'Khác';
      if (!byService[sName]) {
        byService[sName] = { count: 0, total: 0 };
      }
      byService[sName].count += 1;
      byService[sName].total += Number(b.totalPrice) || 0;
    });

    // Thống kê theo tháng (YYYY-MM)
    const monthlySpending = {};
    completedBookings.forEach((b) => {
      const d = b.completedAt || b.createdAt;
      if (d) {
        const key = new Date(d).toISOString().slice(0, 7);
        monthlySpending[key] = (monthlySpending[key] || 0) + (Number(b.totalPrice) || 0);
      }
    });

    res.json({
      totalSpent,
      completedCount,
      byService,
      monthlySpending,
      recentBookings: completedBookings.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thống kê chi tiêu', error: error.message });
  }
};

// Cập nhật trạng thái thủ công (chỉ dành cho Admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateData = { status };
    if (status) {
      updateData.statusColor = getStatusColor(status);
    }

    const updated = await Booking.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ để cập nhật' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi cập nhật trạng thái', error: error.message });
  }
};

// Xóa đơn (chỉ dành cho Admin)
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ để xóa' });
    }
    res.json({ message: 'Đã xóa đơn dịch vụ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa đơn dịch vụ', error: error.message });
  }
};
