import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import Notification from '../models/Notification.js';

// Danh sách hồ sơ KYC đang chờ duyệt
export const getPendingKycList = async (req, res) => {
  try {
    const users = await User.find({ 'kyc.status': 'PENDING' })
      .select('-password')
      .sort({ 'kyc.submittedAt': -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải danh sách KYC chờ duyệt', error: error.message });
  }
};

// Duyệt hồ sơ KYC lên Cấp 2 (Role.md 7.4 & Requirement 4)
export const approveKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    user.kycLevel = 2;
    if (!user.kyc) user.kyc = {};
    user.kyc.status = 'APPROVED';
    user.kyc.reviewedAt = new Date();
    user.kyc.rejectReason = '';
    await user.save();

    // Requirement 4: Tự tạo hoặc cập nhật hồ sơ Worker liên kết với userId để hiện ở trang /helpers
    if (user.role === 'helper') {
      let worker = await Worker.findOne({ userId: user._id });
      if (!worker) {
        // Kiểm tra xem đã có worker trùng tên chưa hoặc tạo mới
        const workerCode = `WK-${user._id.toString().slice(-4)}`;
        worker = await Worker.create({
          userId: user._id,
          code: workerCode,
          name: user.name,
          avatar: user.avatar || user.kyc?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
          role: 'Người giúp việc chuyên nghiệp (Cấp 2)',
          experience: 'Đã xác minh KYC',
          experienceYears: 3,
          area: user.address ? user.address.split(',').pop().trim() : 'Hà Nội',
          skills: ['Dọn dẹp', 'Nấu ăn'],
          hourlyRate: 120000,
          rating: 5.0,
          reviewsCount: 0,
          jobsDone: 0,
          verified: true,
          bio: 'Đã hoàn thành xác minh danh tính Cấp 2 với Ban quản trị GiúpViệc24.',
          phone: user.phone || '',
        });
      } else {
        worker.verified = true;
        worker.name = user.name;
        if (user.avatar) worker.avatar = user.avatar;
        await worker.save();
      }
    }

    // Thông báo cho người dùng
    await Notification.create({
      userId: user._id,
      title: 'Hồ sơ KYC Cấp 2 đã được phê duyệt!',
      message: 'Chúc mừng bạn! Hồ sơ CCCD đã được Admin xác nhận. Bạn đã mở khóa toàn bộ quyền nhận ca từ Chợ việc làm.',
      type: 'KYC',
      link: user.role === 'enterprise' ? '/enterprise' : '/helper',
    }).catch(() => {});

    res.json({
      success: true,
      message: `Đã phê duyệt tài khoản ${user.name} lên Cấp 2 thành công!`,
      user,
    });
  } catch (error) {
    console.error('Approve KYC error:', error);
    res.status(500).json({ message: 'Lỗi phê duyệt KYC', error: error.message });
  }
};

// Từ chối hồ sơ KYC
export const rejectKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason = 'Ảnh chụp CCCD mờ hoặc thông tin không trùng khớp' } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (!user.kyc) user.kyc = {};
    user.kyc.status = 'REJECTED';
    user.kyc.rejectReason = reason;
    user.kyc.reviewedAt = new Date();
    await user.save();

    await Notification.create({
      userId: user._id,
      title: 'Hồ sơ KYC chưa đạt yêu cầu',
      message: `Hồ sơ nâng Cấp 2 của bạn bị từ chối với lý do: "${reason}". Vui lòng cập nhật lại ảnh rõ nét và gửi lại.`,
      type: 'KYC',
      link: user.role === 'enterprise' ? '/enterprise' : '/helper',
    }).catch(() => {});

    res.json({ success: true, message: 'Đã từ chối hồ sơ KYC thành công!', user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi từ chối KYC', error: error.message });
  }
};

// Quản lý người dùng: Danh sách (Role.md 2.1)
export const getUsersList = async (req, res) => {
  try {
    const { role, search, status } = req.query;
    let query = {};
    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải danh sách người dùng', error: error.message });
  }
};

// Khóa / Mở khóa tài khoản (Role.md 2.1)
export const toggleLockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason = '' } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Không thể khóa tài khoản Admin!' });
    }

    const isLocking = user.status !== 'LOCKED';
    user.status = isLocking ? 'LOCKED' : 'ACTIVE';
    user.lockReason = isLocking ? reason || 'Vi phạm chính sách nền tảng' : '';
    await user.save();

    res.json({
      success: true,
      message: isLocking ? `Đã khóa tài khoản ${user.name}` : `Đã mở khóa cho tài khoản ${user.name}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thay đổi trạng thái tài khoản', error: error.message });
  }
};

// Thống kê tổng quan cho Admin Dashboard (Role.md 2.1)
export const getAdminStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: { $in: ['COMPLETED', 'Đã hoàn thành'] } });
    const pendingBookings = await Booking.countDocuments({ status: { $in: ['PENDING', 'Chờ người nhận'] } });
    const activeBookings = await Booking.countDocuments({ status: { $in: ['UPCOMING', 'IN_PROGRESS', 'AWAITING_PAYMENT'] } });
    const pendingKycCount = await User.countDocuments({ 'kyc.status': 'PENDING' });

    // Doanh thu sàn từ các ca đã hoàn tất
    const completedList = await Booking.find(
      { status: { $in: ['COMPLETED', 'Đã hoàn thành'] } },
      'platformFee totalPrice'
    );
    const totalPlatformRevenue = completedList.reduce((sum, b) => sum + (b.platformFee || Math.round(b.totalPrice * 0.2)), 0);
    const totalGrossMerchandiseValue = completedList.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalHelpers = await User.countDocuments({ role: 'helper' });
    const totalEnterprises = await User.countDocuments({ role: 'enterprise' });

    res.json({
      revenue: {
        platformRevenue: totalPlatformRevenue,
        grossVolume: totalGrossMerchandiseValue,
      },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        pending: pendingBookings,
        active: activeBookings,
      },
      users: {
        customers: totalCustomers,
        helpers: totalHelpers,
        enterprises: totalEnterprises,
        pendingKyc: pendingKycCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải thống kê', error: error.message });
  }
};

