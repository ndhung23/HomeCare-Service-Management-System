import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

const getStatusColor = (status) => {
  switch (status) {
    case 'Đã hoàn thành': return 'emerald';
    case 'Sắp diễn ra': return 'blue';
    case 'Đang thực hiện': return 'indigo';
    case 'Đã hủy': return 'rose';
    case 'Chờ người nhận':
    default: return 'amber';
  }
};

export const createBooking = async (req, res) => {
  try {
    const bookingData = { ...req.body };
    if (!bookingData.bookingCode) {
      bookingData.bookingCode = `BK-${Date.now().toString().slice(-4)}`;
    }
    if (!bookingData.status) {
      bookingData.status = 'Chờ người nhận';
    }
    bookingData.statusColor = getStatusColor(bookingData.status);

    const newBooking = await Booking.create(bookingData);
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({ message: 'Lỗi khi tạo đơn đặt dịch vụ', error: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { email, status } = req.query;
    let query = {};
    if (email) {
      query.customerEmail = email.toLowerCase();
    }
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn dịch vụ', error: error.message });
  }
};

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

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateData = { status };
    if (status) {
      updateData.statusColor = getStatusColor(status);
    }

    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await Booking.findByIdAndUpdate(id, updateData, { new: true });
    }
    if (!updated) {
      updated = await Booking.findOneAndUpdate({ bookingCode: id }, updateData, { new: true });
    }

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ để cập nhật' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi cập nhật trạng thái', error: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Booking.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Booking.findOneAndDelete({ bookingCode: id });
    }
    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ để xóa' });
    }
    res.json({ message: 'Đã xóa đơn dịch vụ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa đơn dịch vụ', error: error.message });
  }
};

