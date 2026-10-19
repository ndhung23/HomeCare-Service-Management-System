import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Bạn chưa đăng nhập hoặc không có token xác thực',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'giupviec24_jwt_secret_key_2026'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản liên kết với token này không tồn tại',
      });
    }

    if (user.status === 'LOCKED') {
      return res.status(403).json({
        success: false,
        message: `Tài khoản của bạn đã bị khóa. Lý do: ${user.lockReason || 'Vi phạm điều khoản hệ thống'}. Vui lòng liên hệ Admin.`,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token xác thực không hợp lệ hoặc đã hết hạn',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Tài khoản vai trò '${req.user?.role || 'khách'}' không có quyền truy cập chức năng này`,
      });
    }
    next();
  };
};

export const requireKycLevel = (requiredLevel = 2) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng' });
    }
    if (['admin', 'customer'].includes(req.user.role)) {
      return next();
    }
    if ((req.user.kycLevel || 1) < requiredLevel) {
      return res.status(403).json({
        success: false,
        code: 'KYC_REQUIRED',
        message: `Chức năng này yêu cầu tài khoản Cấp ${requiredLevel} (Đã được Admin xác thực hồ sơ CCCD)`,
      });
    }
    next();
  };
};

export const optionalProtect = async (req, res, next) => {
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'giupviec24_jwt_secret_key_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Token expired or invalid, proceed as unauthenticated
      req.user = null;
    }
  }
  next();
};

export default { protect, authorize, optionalProtect };

