import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getFileUrl } from '../middleware/uploadMiddleware.js';

// Nộp hồ sơ KYC để nâng lên Cấp 2 (Role.md Mục 7)
export const submitKyc = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const {
      fullName,
      dob,
      gender,
      idNumber,
      companyName,
      taxCode,
      avatarUrl: rawAvatar,
      idFrontUrl: rawFront,
      idBackUrl: rawBack,
      businessLicenseUrl: rawLicense,
    } = req.body;

    let avatarUrl = rawAvatar || user.avatar || '';
    let idFrontUrl = rawFront || '';
    let idBackUrl = rawBack || '';
    let businessLicenseUrl = rawLicense || '';

    // Lấy URL từ file upload nếu có
    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        avatarUrl = getFileUrl(req, req.files.avatar[0]);
      }
      if (req.files.idFront && req.files.idFront[0]) {
        idFrontUrl = getFileUrl(req, req.files.idFront[0]);
      }
      if (req.files.idBack && req.files.idBack[0]) {
        idBackUrl = getFileUrl(req, req.files.idBack[0]);
      }
      if (req.files.businessLicense && req.files.businessLicense[0]) {
        businessLicenseUrl = getFileUrl(req, req.files.businessLicense[0]);
      }
    }

    if (!idNumber && !user.kyc?.idNumber) {
      return res.status(400).json({ message: 'Vui lòng cung cấp số CCCD/CMND' });
    }

    user.kyc = {
      status: 'PENDING',
      fullName: fullName || user.kyc?.fullName || user.name,
      dob: dob || user.kyc?.dob || '',
      gender: gender || user.kyc?.gender || 'Nữ',
      idNumber: idNumber || user.kyc?.idNumber,
      avatarUrl: avatarUrl || user.kyc?.avatarUrl || user.avatar,
      idFrontUrl: idFrontUrl || user.kyc?.idFrontUrl,
      idBackUrl: idBackUrl || user.kyc?.idBackUrl,
      companyName: companyName || user.kyc?.companyName || '',
      taxCode: taxCode || user.kyc?.taxCode || '',
      businessLicenseUrl: businessLicenseUrl || user.kyc?.businessLicenseUrl || '',
      rejectReason: '',
      submittedAt: new Date(),
    };

    if (avatarUrl) {
      user.avatar = avatarUrl;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Hồ sơ KYC đã được gửi thành công! Vui lòng chờ Admin xét duyệt lên Cấp 2.',
      kyc: user.kyc,
    });
  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({ message: 'Lỗi nộp hồ sơ KYC', error: error.message });
  }
};

// Xem trạng thái KYC hiện tại
export const getMyKycStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('kyc kycLevel name email phone role avatar');
    res.json({
      kycLevel: user?.kycLevel || 1,
      kyc: user?.kyc || { status: 'NOT_SUBMITTED' },
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải trạng thái KYC', error: error.message });
  }
};

