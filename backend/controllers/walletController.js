import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import WithdrawRequest from '../models/WithdrawRequest.js';
import Notification from '../models/Notification.js';
import Dispute from '../models/Dispute.js';

// Xem số dư ví và lịch sử giao dịch cá nhân
export const getMyWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wallet bank kycLevel');
    const transactions = await WalletTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const withdraws = await WithdrawRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      available: user?.wallet?.available || 0,
      locked: user?.wallet?.locked || 0,
      bank: user?.bank || {},
      kycLevel: user?.kycLevel || 1,
      transactions,
      withdraws,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải thông tin ví', error: error.message });
  }
};

// Cập nhật thông tin tài khoản ngân hàng liên kết
export const updateBankInfo = async (req, res) => {
  try {
    const { bankName, accountNumber, accountName } = req.body;
    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên ngân hàng, số tài khoản và chủ tài khoản' });
    }

    const user = await User.findById(req.user._id);
    user.bank = { bankName, accountNumber, accountName: accountName.toUpperCase() };
    await user.save();

    res.json({ success: true, message: 'Đã cập nhật thông tin ngân hàng thành công!', bank: user.bank });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật tài khoản ngân hàng', error: error.message });
  }
};

// Tạo yêu cầu rút tiền về ngân hàng (Role.md 9.4 & 14)
export const requestWithdraw = async (req, res) => {
  try {
    const { amount, bankName, accountNumber, accountName } = req.body;
    const withdrawAmount = Number(amount);

    if (isNaN(withdrawAmount) || withdrawAmount < 200000) {
      return res.status(400).json({ message: 'Hạn mức rút tối thiểu là 200.000đ theo quy định sàn' });
    }

    const user = await User.findById(req.user._id);

    if ((user.kycLevel || 1) < 2) {
      return res.status(403).json({ message: 'Chỉ tài khoản Cấp 2 đã xác minh mới được phép rút tiền' });
    }

    // Kiểm tra giới hạn tối đa 3 lệnh rút / ngày (Role.md Mục 14)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayCount = await WithdrawRequest.countDocuments({
      userId: user._id,
      createdAt: { $gte: startOfDay },
    });
    if (todayCount >= 3) {
      return res.status(400).json({
        message: 'Bạn đã đạt giới hạn tối đa 3 lệnh rút tiền trong ngày theo quy định sàn!',
      });
    }

    if ((user.wallet?.available || 0) < withdrawAmount) {
      return res.status(400).json({
        message: `Số dư khả dụng không đủ! Hiện tại bạn có ${(user.wallet?.available || 0).toLocaleString('vi-VN')}đ`,
      });
    }

    const bank = {
      bankName: bankName || user.bank?.bankName,
      accountNumber: accountNumber || user.bank?.accountNumber,
      accountName: (accountName || user.bank?.accountName || '').toUpperCase(),
    };

    if (!bank.bankName || !bank.accountNumber || !bank.accountName) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin tài khoản ngân hàng nhận tiền' });
    }

    // Kiểm tra các cờ bất thường (Role.md Flow 6 & Mục 14)
    let isFlagged = false;
    const flagReasons = [];

    if (withdrawAmount > 5000000) {
      isFlagged = true;
      flagReasons.push('Số tiền rút lớn (> 5.000.000đ)');
    }

    // Kiểm tra tài khoản có khiếu nại đang mở
    const activeDispute = await Dispute.findOne({
      $or: [{ creatorId: user._id }, { respondentId: user._id }],
      status: { $in: ['OPEN', 'IN_REVIEW'] },
    });
    if (activeDispute) {
      isFlagged = true;
      flagReasons.push('Tài khoản đang có khiếu nại chưa xử lý xong');
    }

    // Trừ số dư khả dụng
    user.wallet.available -= withdrawAmount;
    await user.save();

    const withdraw = await WithdrawRequest.create({
      userId: user._id,
      amount: withdrawAmount,
      bank,
      status: 'PENDING',
      isFlagged,
      flagReason: flagReasons.join(' | '),
    });

    await WalletTransaction.create({
      userId: user._id,
      type: 'WITHDRAW',
      amount: -withdrawAmount,
      balanceAfter: user.wallet.available,
      note: `Yêu cầu rút ${withdrawAmount.toLocaleString('vi-VN')}đ về ${bank.bankName} (${bank.accountNumber})${isFlagged ? ' [Cần Admin kiểm tra]' : ''}`,
    });

    res.json({
      success: true,
      message: isFlagged
        ? 'Yêu cầu rút tiền đã được tạo. Do số tiền lớn hoặc tài khoản cần kiểm tra, Admin sẽ phê duyệt trong 24 giờ.'
        : 'Yêu cầu rút tiền đã được tạo thành công và đang chờ Admin xử lý!',
      withdraw,
      balance: user.wallet.available,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo yêu cầu rút tiền', error: error.message });
  }
};

// Admin: Danh sách tất cả lệnh rút
export const getAdminWithdrawRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const list = await WithdrawRequest.find(query)
      .populate('userId', 'name email phone role kyc')
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải danh sách lệnh rút', error: error.message });
  }
};

// Admin: Phê duyệt lệnh rút
export const approveWithdrawRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const withdraw = await WithdrawRequest.findById(id);
    if (!withdraw) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu rút tiền' });
    }
    if (withdraw.status !== 'PENDING') {
      return res.status(400).json({ message: `Yêu cầu này đã ở trạng thái ${withdraw.status}` });
    }

    withdraw.status = 'APPROVED';
    withdraw.processedBy = req.user._id;
    withdraw.processedAt = new Date();
    await withdraw.save();

    await Notification.create({
      userId: withdraw.userId,
      title: 'Lệnh rút tiền thành công!',
      message: `Lệnh rút ${withdraw.amount.toLocaleString('vi-VN')}đ về ngân hàng ${withdraw.bank.bankName} đã được duyệt và chuyển khoản thành công.`,
      type: 'WITHDRAW',
      link: '/helper',
    }).catch(() => {});

    res.json({ success: true, message: 'Đã phê duyệt lệnh rút tiền thành công!', withdraw });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi phê duyệt lệnh rút', error: error.message });
  }
};

// Admin: Từ chối lệnh rút (Hoàn tiền về ví)
export const rejectWithdrawRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Thông tin ngân hàng không hợp lệ' } = req.body;
    const withdraw = await WithdrawRequest.findById(id);

    if (!withdraw) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu rút tiền' });
    }
    if (withdraw.status !== 'PENDING') {
      return res.status(400).json({ message: `Yêu cầu này đã ở trạng thái ${withdraw.status}` });
    }

    withdraw.status = 'REJECTED';
    withdraw.rejectReason = reason;
    withdraw.processedBy = req.user._id;
    withdraw.processedAt = new Date();
    await withdraw.save();

    // Hoàn lại tiền vào ví
    const user = await User.findById(withdraw.userId);
    if (user) {
      user.wallet.available += withdraw.amount;
      await user.save();

      await WalletTransaction.create({
        userId: user._id,
        type: 'ADJUST',
        amount: withdraw.amount,
        balanceAfter: user.wallet.available,
        note: `Hoàn tiền lệnh rút bị từ chối: ${reason}`,
      });

      await Notification.create({
        userId: user._id,
        title: 'Lệnh rút tiền bị từ chối',
        message: `Lệnh rút ${withdraw.amount.toLocaleString('vi-VN')}đ bị từ chối (${reason}). Số tiền đã được hoàn trả về ví của bạn.`,
        type: 'WITHDRAW',
        link: '/helper',
      }).catch(() => {});
    }

    res.json({ success: true, message: 'Đã từ chối lệnh rút và hoàn trả tiền vào ví người dùng!', withdraw });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi từ chối lệnh rút', error: error.message });
  }
};

