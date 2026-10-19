import Booking from '../models/Booking.js';
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

// Tạo mới đơn đặt dịch vụ (Role.md 3.1)
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
    if (startAt.getTime() < Date.now() + minLeadMs - 5 * 60 * 1000) { // du di 5 phút chênh lệch đồng hồ
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
      helper: helperName || 'Người giúp việc phù hợp nhất',
      workerId: workerId || '',
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

    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({ message: 'Lỗi khi tạo đơn đặt dịch vụ', error: error.message });
  }
};

// Chợ việc làm mới: Danh sách đơn PENDING (Role.md 1.2 & 5.1)
export const getMarketBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: { $in: ['PENDING', 'Chờ người nhận'] },
    }).sort({ createdAt: -1 });

    // Ẩn số nhà cụ thể và SĐT khách trên Chợ việc làm (Role.md 1.2)
    const sanitized = bookings.map((b) => {
      const parts = (b.address || '').split(',').map((s) => s.trim());
      // Giữ lại quận/huyện + tỉnh/thành phố, che số nhà chi tiết
      const maskedAddress = parts.length > 2 ? parts.slice(-2).join(', ') : b.address;

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
