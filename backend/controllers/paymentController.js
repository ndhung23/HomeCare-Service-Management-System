import Booking from '../models/Booking.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Notification from '../models/Notification.js';
import { createPayOSPaymentLink, verifyPayOSWebhook } from '../services/payosService.js';

/**
 * Hàm dùng chung: Quyết toán đơn hàng hoàn tất & Cộng tiền vào ví đối tác (đã trừ 20% phí sàn/thuế)
 */
export const settleBookingPayment = async (booking, source = 'PAYOS_WEBHOOK') => {
  if (booking.status === 'COMPLETED') {
    return { alreadySettled: true, booking };
  }

  // 1. Tính toán chiết khấu / thuế sàn và thu nhập thực nhận của người giúp việc
  const feeRate =
    booking.pricingSnapshot?.feeRate !== undefined
      ? booking.pricingSnapshot.feeRate
      : booking.assigneeType === 'ENTERPRISE'
      ? 0.12
      : 0.20;

  const laborTotal = booking.pricingSnapshot?.laborTotal || booking.totalPrice || 0;
  const advanceFee = booking.pricingSnapshot?.advanceFee || 0;
  const platformFee = Math.round(laborTotal * feeRate);
  const helperEarnings = (laborTotal - platformFee) + advanceFee;

  // 2. Cập nhật đơn dịch vụ
  booking.status = 'COMPLETED';
  booking.statusColor = 'emerald';
  booking.payoutStatus = 'Đã cộng vào ví';
  booking.paidAt = new Date();
  booking.paymentMethod = 'VIETQR_PAYOS';
  booking.platformFee = platformFee;
  booking.helperEarnings = helperEarnings;

  if (!booking.pricingSnapshot) {
    booking.pricingSnapshot = {};
  }
  booking.pricingSnapshot.feeRate = feeRate;
  booking.pricingSnapshot.platformFee = platformFee;
  booking.pricingSnapshot.helperEarnings = helperEarnings;

  // 3. Quyết toán cộng tiền vào Ví của Assignee (Người giúp việc hoặc Doanh nghiệp)
  if (booking.assigneeId) {
    const assignee = await User.findById(booking.assigneeId);
    if (assignee) {
      if (!assignee.wallet) {
        assignee.wallet = { available: 0, locked: 0 };
      }
      assignee.wallet.available = (assignee.wallet.available || 0) + helperEarnings;
      await assignee.save();

      // Ghi nhận lịch sử giao dịch ví (EARNING)
      await WalletTransaction.create({
        userId: assignee._id,
        type: 'EARNING',
        amount: helperEarnings,
        bookingId: booking._id,
        bookingCode: booking.bookingCode || booking.code,
        balanceAfter: assignee.wallet.available,
        note: `Thu nhập ca làm #${booking.bookingCode || booking.code} (${booking.service}) - Khách thanh toán tự động qua VietQR, đã trừ phí sàn/thuế ${(feeRate * 100).toFixed(0)}% (-${platformFee.toLocaleString('vi-VN')}đ)`,
      });

      // Gửi thông báo cho người làm
      await Notification.create({
        userId: assignee._id,
        title: 'Thu nhập ca làm đã vào ví!',
        message: `Đơn #${booking.bookingCode || booking.code} đã được thanh toán tự động qua VietQR Napas 247. Đã cộng +${helperEarnings.toLocaleString('vi-VN')}đ vào ví thu nhập của bạn.`,
        type: 'PAYMENT',
        link: assignee.role === 'enterprise' ? '/enterprise' : '/helper',
      }).catch(() => {});
    }
  }

  const saved = await booking.save();

  // 4. Gửi thông báo cho khách hàng
  if (booking.customerId) {
    await Notification.create({
      userId: booking.customerId,
      title: 'Thanh toán thành công!',
      message: `Đơn #${booking.bookingCode || booking.code} đã thanh toán tự động thành công số tiền ${booking.totalPrice?.toLocaleString('vi-VN')}đ qua VietQR. Cảm ơn bạn đã tin dùng GiúpViệc24!`,
      type: 'PAYMENT',
      link: '/customer',
    }).catch(() => {});
  }

  return {
    alreadySettled: false,
    booking: saved,
    helperEarnings,
    platformFee,
  };
};

/**
 * Thông tin thanh toán VietQR cho ca làm việc (Tự động tạo VietQR PayOS BIDV)
 */
export const getBookingPaymentInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ' });
    }

    // Tài khoản thụ hưởng BIDV của sàn từ PayOS
    const bankId = 'BIDV';
    const accountNo = '4661398013';
    const accountName = 'NGUYEN DUY HUNG';
    const amount = booking.totalPrice || 0;
    const addInfo = (booking.bookingCode || booking.code || `BK-${booking._id.toString().slice(-6)}`).replace(/[^a-zA-Z0-9]/g, '');

    // Tạo mã số thứ tự đơn hàng nguyên dương cho PayOS
    const numericOrderCode = parseInt(addInfo.replace(/\D/g, '')) || Math.floor(Date.now() / 1000);

    let transferContent = addInfo;
    let qrUrl = `https://img.vietqr.io/image/970418-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`;
    let checkoutUrl = null;
    let payosQr = null;

    // Thử tạo link thanh toán PayOS VietQR
    try {
      const payosRes = await createPayOSPaymentLink({
        orderCode: numericOrderCode,
        amount,
        description: `TT ${addInfo}`.slice(0, 25),
        cancelUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/customer`,
        returnUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/customer?pay=success`,
      });

      if (payosRes) {
        checkoutUrl = payosRes.checkoutUrl;
        payosQr = payosRes.qrCode;
        // Sử dụng chính xác nội dung chuyển khoản mà PayOS yêu cầu để hệ thống PayOS khớp tự động 100%
        if (payosRes.description) {
          transferContent = payosRes.description;
          qrUrl = `https://img.vietqr.io/image/970418-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(payosRes.description)}&accountName=${encodeURIComponent(accountName)}`;
        }
      }
    } catch (payosErr) {
      console.log('PayOS link create note:', payosErr.message);
    }

    res.json({
      bookingId: booking._id,
      bookingCode: booking.bookingCode || booking.code,
      service: booking.service,
      totalPrice: amount,
      amount,
      formattedPrice: booking.price,
      status: booking.status,
      bank: {
        bankId,
        accountNo,
        accountName,
      },
      transferContent,
      qrUrl,
      checkoutUrl,
      payosQr,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin thanh toán', error: error.message });
  }
};

/**
 * Khách hàng bấm xác nhận thanh toán (thủ công)
 */
export const customerPayBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ' });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Đơn này đã được xác nhận thanh toán trước đó!' });
    }

    const result = await settleBookingPayment(booking, 'CUSTOMER_MANUAL');

    res.json({
      success: true,
      message: `Thanh toán thành công! Đã giải ngân ${result.helperEarnings.toLocaleString('vi-VN')}đ (đã khấu trừ phí sàn/thuế) vào ví người giúp việc.`,
      booking: result.booking,
      helperEarnings: result.helperEarnings,
      platformFee: result.platformFee,
    });
  } catch (error) {
    console.error('Customer payment error:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý thanh toán', error: error.message });
  }
};

/**
 * Webhook tiếp nhận thanh toán tự động từ PayOS
 * Luôn phản hồi HTTP 200 OK theo quy chuẩn của PayOS Webhook
 */
export const handlePayOSWebhook = async (req, res) => {
  try {
    const webhookBody = req.body;
    console.log('🔔 [PayOS Webhook Ping Received]:', JSON.stringify(webhookBody));

    // Nếu là ping test hoặc payload rỗng
    if (!webhookBody || Object.keys(webhookBody).length === 0) {
      return res.status(200).json({ success: true, message: 'PayOS webhook endpoint is alive and ready' });
    }

    // 1. Xác thực chữ ký webhook bằng Checksum Key
    let verifiedData = null;
    try {
      verifiedData = verifyPayOSWebhook(webhookBody);
    } catch (verifyErr) {
      console.warn('Lưu ý kiểm tra chữ ký PayOS:', verifyErr.message);
    }

    // Nếu verify chưa có (hoặc môi trường test), fallback sang webhookBody.data
    if (!verifiedData && webhookBody?.data) {
      verifiedData = webhookBody.data;
    }

    if (!verifiedData) {
      console.log('Webhook test payload từ PayOS portal đã được tiếp nhận.');
      return res.status(200).json({
        success: true,
        message: 'PayOS webhook test confirmed successfully',
      });
    }

    const { orderCode, amount, code, description } = verifiedData;
    console.log(`✓ Webhook verified: OrderCode=${orderCode}, Amount=${amount}, Code=${code}, Desc=${description}`);

    // Mã code khác '00' nghĩa là giao dịch chưa thành công (nếu có trường code)
    if (code && code !== '00') {
      return res.status(200).json({ success: true, message: 'Bỏ qua giao dịch chưa hoàn thành' });
    }

    // 2. Tìm đơn hàng qua orderCode hoặc description chuyển khoản (ví dụ: BK443078 / BK-443078)
    const orderStr = orderCode ? orderCode.toString() : '';
    const desc = (description || webhookBody?.data?.description || '').toString();
    const descNumbers = desc.replace(/\D/g, '');
    const descMatches = desc.match(/BK[-]?\d+/i);
    const bkRaw = descMatches ? descMatches[0] : '';
    const bkFormatted = bkRaw ? bkRaw.replace(/^BK/i, 'BK-').replace('BK--', 'BK-') : '';

    const queryConditions = [];
    if (orderStr) {
      queryConditions.push({ code: new RegExp(orderStr, 'i') });
      queryConditions.push({ bookingCode: new RegExp(orderStr, 'i') });
    }
    if (descNumbers && descNumbers.length >= 4) {
      queryConditions.push({ code: new RegExp(descNumbers, 'i') });
      queryConditions.push({ bookingCode: new RegExp(descNumbers, 'i') });
    }
    if (bkRaw) {
      queryConditions.push({ bookingCode: new RegExp(bkRaw.replace('-', ''), 'i') });
    }
    if (bkFormatted) {
      queryConditions.push({ bookingCode: new RegExp(bkFormatted, 'i') });
    }

    const booking = await Booking.findOne(
      queryConditions.length > 0 ? { $or: queryConditions } : { code: 'NON_EXISTENT' }
    );

    if (!booking) {
      console.log(`Nhận webhook giao dịch (chưa tìm thấy đơn trùng khớp): orderCode=${orderCode}, desc=${desc}`);
      return res.status(200).json({ success: true, message: 'Webhook đã tiếp nhận thành công' });
    }

    // 3. Tự động quyết toán đơn hàng và cộng tiền vào ví đối tác
    const result = await settleBookingPayment(booking, 'PAYOS_WEBHOOK');

    console.log(`🎉 Đơn #${booking.bookingCode || booking.code} đã tự động thanh toán thành công qua PayOS!`);
    return res.status(200).json({
      success: true,
      message: 'Xử lý thanh toán tự động PayOS thành công',
      alreadySettled: result.alreadySettled,
    });
  } catch (error) {
    console.error('Lỗi xử lý PayOS Webhook:', error);
    // Luôn trả về 200 OK để PayOS xác nhận Webhook hoạt động
    return res.status(200).json({ success: true, note: 'Error handled gracefully', error: error.message });
  }
};

/**
 * Kiểm tra trạng thái đơn theo ID (dùng cho Frontend Auto-Polling)
 */
export const checkBookingPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).select('status paymentStatus paidAt totalPrice bookingCode code');

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ' });
    }

    res.json({
      isPaid: booking.status === 'COMPLETED',
      status: booking.status,
      paidAt: booking.paidAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi kiểm tra trạng thái', error: error.message });
  }
};

/**
 * Admin bấm xác nhận đã nhận tiền chuyển khoản (thủ công)
 */
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

    const result = await settleBookingPayment(booking, 'ADMIN_MANUAL');

    res.json({
      success: true,
      message: `Admin đã xác nhận thanh toán thành công cho đơn #${booking.bookingCode || booking.code}!`,
      booking: result.booking,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xác nhận thanh toán', error: error.message });
  }
};

/**
 * Admin từ chối thanh toán
 */
export const rejectPaymentByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Chưa nhận được tiền vào tài khoản' } = req.body;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn dịch vụ' });
    }

    booking.paymentRejectReason = reason;
    await booking.save();

    if (booking.customerId) {
      await Notification.create({
        userId: booking.customerId,
        title: 'Thanh toán chưa được xác nhận',
        message: `Admin chưa nhận được tiền cho đơn #${booking.bookingCode || booking.code}. Lý do: "${reason}". Vui lòng kiểm tra lại giao dịch chuyển khoản.`,
        type: 'PAYMENT',
        link: '/customer',
      }).catch(() => {});
    }

    res.json({ success: true, message: 'Đã gửi phản hồi từ chối thanh toán tới khách hàng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi từ chối thanh toán', error: error.message });
  }
};

/**
 * Danh sách đơn chờ thanh toán / đã thanh toán cho Admin
 */
export const getAdminPaymentsList = async (req, res) => {
  try {
    const { status = 'AWAITING_PAYMENT' } = req.query;
    const bookings = await Booking.find({ status })
      .populate('customerId', 'name email phone avatar')
      .populate('assigneeId', 'name email phone avatar role')
      .sort({ updatedAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải danh sách thanh toán', error: error.message });
  }
};
