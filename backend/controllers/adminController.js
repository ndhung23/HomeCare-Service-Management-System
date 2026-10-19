import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import Notification from '../models/Notification.js';
import SystemConfig from '../models/SystemConfig.js';
import ContentItem from '../models/ContentItem.js';

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

// Cấu hình hệ thống động (Role.md Mục 14)
export const getSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne({ key: 'PRIMARY_CONFIG' });
    if (!config) {
      config = await SystemConfig.create({ key: 'PRIMARY_CONFIG' });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải cấu hình hệ thống', error: error.message });
  }
};

export const updateSystemConfig = async (req, res) => {
  try {
    const {
      baseHourlyRates,
      serviceStatus,
      holidays,
      holidayMultiplier,
      helperCommissionRate,
      enterpriseCommissionRate,
    } = req.body;

    let config = await SystemConfig.findOne({ key: 'PRIMARY_CONFIG' });
    if (!config) {
      config = new SystemConfig({ key: 'PRIMARY_CONFIG' });
    }

    if (baseHourlyRates) config.baseHourlyRates = { ...config.baseHourlyRates, ...baseHourlyRates };
    if (serviceStatus) config.serviceStatus = { ...config.serviceStatus, ...serviceStatus };
    if (holidays) config.holidays = holidays;
    if (holidayMultiplier !== undefined) config.holidayMultiplier = Number(holidayMultiplier);
    if (helperCommissionRate !== undefined) config.helperCommissionRate = Number(helperCommissionRate);
    if (enterpriseCommissionRate !== undefined) config.enterpriseCommissionRate = Number(enterpriseCommissionRate);
    config.updatedBy = req.user._id;

    await config.save();
    res.json({ success: true, message: 'Đã lưu cấu hình hệ thống thành công!', config });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật cấu hình', error: error.message });
  }
};

// Quản lý Content Items (FAQ / Tin tức / Chính sách - Role.md 2.1.h)
export const getContentItems = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type) query.type = type;

    const items = await ContentItem.find(query).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải danh sách nội dung', error: error.message });
  }
};

export const createOrUpdateContentItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, category, content, summary, imageUrl, order, isPublished } = req.body;

    if (id) {
      const updated = await ContentItem.findByIdAndUpdate(
        id,
        { type, title, category, content, summary, imageUrl, order, isPublished, authorId: req.user._id },
        { new: true }
      );
      return res.json({ success: true, message: 'Đã cập nhật nội dung thành công!', item: updated });
    }

    const created = await ContentItem.create({
      type: type || 'FAQ',
      title,
      category: category || 'Chung',
      content,
      summary: summary || '',
      imageUrl: imageUrl || '',
      order: Number(order) || 0,
      isPublished: isPublished !== false,
      authorId: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Đã tạo nội dung mới thành công!', item: created });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lưu nội dung', error: error.message });
  }
};

export const deleteContentItem = async (req, res) => {
  try {
    const { id } = req.params;
    await ContentItem.findByIdAndDelete(id);
    res.json({ success: true, message: 'Đã xóa nội dung thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa nội dung', error: error.message });
  }
};

// Xóa vi phạm oan cho người dùng (Role.md 8.6 & Mục 15.2)
export const removeUserViolation = async (req, res) => {
  try {
    const { userId, violationId } = req.params;
    const { adminNote = '' } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const violation = (user.violations || []).id(violationId);
    if (!violation) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi vi phạm' });
    }

    violation.removedByAdmin = true;
    violation.adminNote = adminNote || 'Admin đã gỡ vi phạm này';

    // Đếm lại vi phạm hợp lệ còn lại trong 90 ngày
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const activeViolations = (user.violations || []).filter(
      (v) => !v.removedByAdmin && new Date(v.createdAt) >= ninetyDaysAgo
    );

    if (activeViolations.length < 2) {
      user.jobClaimLockedUntil = null;
    }
    if (activeViolations.length < 3 && user.lockReason?.includes('vi phạm')) {
      user.status = 'ACTIVE';
      user.lockReason = '';
    }

    await user.save();
    res.json({ success: true, message: 'Đã gỡ bỏ vi phạm thành công cho người dùng', user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gỡ vi phạm', error: error.message });
  }
};

