import Booking from '../models/Booking.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Notification from '../models/Notification.js';

// Thông tin thanh toán VietQR cho ca làm việc (Role.md 9.1)
export const getBookingPaymentInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ' });
    }

    const bankId = process.env.PLATFORM_BANK_ID || 'MB';
    const accountNo = process.env.PLATFORM_BANK_ACCOUNT || '0987654321';
    const accountName = process.env.PLATFORM_BANK_NAME || 'CONG TY DICH VU GIUPVIEC24';
    const amount = booking.totalPrice || 0;
    const addInfo = booking.bookingCode;

    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`;

    res.json({
      bookingId: booking._id,
      bookingCode: booking.bookingCode,
      service: booking.service,
      totalPrice: amount,
      formattedPrice: booking.price,
      status: booking.status,
      bank: {
        bankId,
        accountNo,
        accountName,
      },
      transferContent: addInfo,
      qrUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin thanh toán', error: error.message });
  }
};

// Admin bấm xác nhận đã nhận tiền chuyển khoản (Role.md 9.1 & Lựa chọn MVP của User)
export const confirmPaymentByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ' });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Đơn này đã được xác nhận thanh toán trước đó!' });
    }

    // Cập nhật trạng thái Booking
    booking.status = 'COMPLETED';
    booking.statusColor = 'emerald';
    booking.payoutStatus = 'Đã cộng vào ví';
    booking.paidAt = new Date();
    booking.paymentConfirmedBy = req.user._id;

    const earnings = booking.pricingSnapshot?.helperEarnings || booking.helperEarnings || Math.round(booking.totalPrice * 0.8);

    // Quyết toán cộng tiền vào Ví của Assignee (Helper / Enterprise)
    if (booking.assigneeId) {
      const assignee = await User.findById(booking.assigneeId);
      if (assignee) {
        if (!assignee.wallet) assignee.wallet = { available: 0, locked: 0 };
        assignee.wallet.available = (assignee.wallet.available || 0) + earnings;
        await assignee.save();

        // Ghi lịch sử giao dịch ví
        await WalletTransaction.create({
          userId: assignee._id,
          type: 'EARNING',
          amount: earnings,
          bookingId: booking._id,
          bookingCode: booking.bookingCode,
          balanceAfter: assignee.wallet.available,
          note: `Thu nhập ca làm việc ${booking.bookingCode} (${booking.service})`,
        });

        // Bắn thông báo cho người nhận việc
        await Notification.create({
          userId: assignee._id,
          title: 'Thu nhập đã vào ví!',
          message: `Khách hàng đã thanh toán ca ${booking.bookingCode}. Đã cộng +${earnings.toLocaleString('vi-VN')}đ vào ví thu nhập của bạn.`,
          type: 'PAYMENT',
          link: '/helper',
        }).catch(() => {});
      }
    }

    const saved = await booking.save();

    // Thông báo cho khách hàng
    if (booking.customerId) {
      await Notification.create({
        userId: booking.customerId,
        title: 'Thanh toán thành công!',
        message: `Đơn ${booking.bookingCode} đã hoàn tất. Cảm ơn bạn đã sử dụng GiúpViệc24! Hãy để lại đánh giá dịch vụ nhé.`,
        type: 'PAYMENT',
        link: '/customer',
      }).catch(() => {});
    }

    res.json({
      success: true,
      message: `Đã xác nhận thanh toán thành công cho đơn ${booking.bookingCode}! Đã giải ngân ${earnings.toLocaleString('vi-VN')}đ vào ví người giúp việc.`,
      booking: saved,
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Lỗi xác nhận thanh toán', error: error.message });
  }
};

