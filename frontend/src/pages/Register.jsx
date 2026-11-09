import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  User, 
  UserCheck, 
  Building2, 
  ArrowLeft, 
  Mail, 
  Lock, 
  Phone, 
  Check, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const [role, setRole] = useState('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [touched, setTouched] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Real-time validations
  const errors = useMemo(() => {
    const errs = {};

    // 1. Họ và tên
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      errs.fullName = 'Vui lòng nhập họ và tên';
    } else if (trimmedName.length < 2) {
      errs.fullName = 'Họ và tên phải có tối thiểu 2 ký tự';
    } else if (trimmedName.length > 60) {
      errs.fullName = 'Họ và tên không được dài quá 60 ký tự';
    }

    // 2. Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = 'Vui lòng nhập địa chỉ email';
    } else if (!emailRegex.test(trimmedEmail)) {
      errs.email = 'Email không hợp lệ (ví dụ: hoten@gmail.com)';
    }

    // 3. Số điện thoại (Việt Nam 10 chữ số)
    const cleanPhone = phone.replace(/\s+/g, '');
    const phoneRegex = /^(0)(3|5|7|8|9)[0-9]{8}$/;
    if (!cleanPhone) {
      errs.phone = 'Vui lòng nhập số điện thoại';
    } else if (!phoneRegex.test(cleanPhone)) {
      errs.phone = 'Số điện thoại cần 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09';
    }

    // 4. Mật khẩu
    if (!password) {
      errs.password = 'Vui lòng tạo mật khẩu';
    } else if (password.length < 6) {
      errs.password = 'Mật khẩu phải có tối thiểu 6 ký tự';
    }

    // 5. Xác nhận mật khẩu
    if (!confirmPassword) {
      errs.confirmPassword = 'Vui lòng nhập lại mật khẩu';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    // 6. Điều khoản
    if (!agreeTerms) {
      errs.agreeTerms = 'Bạn cần đồng ý với Điều khoản dịch vụ để tiếp tục';
    }

    return errs;
  }, [fullName, email, phone, password, confirmPassword, agreeTerms]);

  // Độ mạnh mật khẩu
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 1, label: 'Yếu', color: 'bg-rose-500', textClass: 'text-rose-600' };
    if (score <= 3) return { score: 2, label: 'Trung bình', color: 'bg-amber-500', textClass: 'text-amber-600' };
    return { score: 3, label: 'Mạnh', color: 'bg-emerald-500', textClass: 'text-emerald-600' };
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Đánh dấu toàn bộ là đã chạm để hiện lỗi nếu có
    const allTouched = {
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    };
    setTouched(allTouched);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      setErrorMessage(firstError);
      toast.warning(firstError);
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await register({
        role,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.replace(/\s+/g, ''),
        password,
        confirmPassword,
      });
      toast.success('Đăng ký tài khoản thành công! Đang chuyển hướng...');
      navigate(newUser.redirectPath || '/');
    } catch (err) {
      console.error('Đăng ký thất bại:', err);
      const apiMessage = err.response?.data?.message || 'Đăng ký tài khoản không thành công, vui lòng thử lại!';
      setErrorMessage(apiMessage);
      toast.error(apiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: 'customer',
      title: 'Khách hàng',
      desc: 'Tìm và thuê người giúp việc uy tín',
      icon: User,
      color: 'blue',
    },
    {
      id: 'helper',
      title: 'Người giúp việc',
      desc: 'Đăng ký tìm việc làm thêm thu nhập',
      icon: UserCheck,
      color: 'emerald',
    },
    {
      id: 'enterprise',
      title: 'Doanh nghiệp',
      desc: 'Cung cấp và quản lý đội ngũ giúp việc',
      icon: Building2,
      color: 'amber',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      
      {/* Back to Home Button */}
      <div className="max-w-xl w-full mx-auto px-4 mb-3">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="text-3xl">🧑‍🌾</span>
            <div className="text-left">
              <span className="text-2xl font-black text-blue-600 tracking-tight">GiúpViệc<span className="text-slate-800">24</span></span>
              <p className="text-[11px] text-slate-500 font-semibold tracking-wide">Tạo tài khoản mới</p>
            </div>
          </Link>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            Đăng ký tài khoản GiúpViệc24
          </h2>
          <p className="mt-1 text-xs text-slate-600 font-medium">
            Chọn loại tài khoản phù hợp với nhu cầu của bạn
          </p>
        </div>

        {/* Role Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {roles.map((r) => {
            const isSelected = role === r.id;
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {r.title}
                </div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  {r.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Register Form */}
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-slate-100 sm:px-8">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm placeholder-slate-400 outline-none transition-all ${
                    touched.fullName && errors.fullName
                      ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : touched.fullName && !errors.fullName
                      ? 'border-emerald-400 bg-emerald-50/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
                {touched.fullName && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {errors.fullName ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                )}
              </div>
              {touched.fullName && errors.fullName && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* 2. Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="email@example.com"
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm placeholder-slate-400 outline-none transition-all ${
                    touched.email && errors.email
                      ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : touched.email && !errors.email
                      ? 'border-emerald-400 bg-emerald-50/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
                {touched.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {errors.email ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                )}
              </div>
              {touched.email && errors.email && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* 3. Phone Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="0987 654 321"
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm placeholder-slate-400 outline-none transition-all ${
                    touched.phone && errors.phone
                      ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : touched.phone && !errors.phone
                      ? 'border-emerald-400 bg-emerald-50/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
                {touched.phone && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {errors.phone ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                )}
              </div>
              {touched.phone && errors.phone && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>

            {/* 4. Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Tạo mật khẩu an toàn (tối thiểu 6 ký tự)"
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm placeholder-slate-400 outline-none transition-all ${
                    touched.password && errors.password
                      ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : touched.password && !errors.password
                      ? 'border-emerald-400 bg-emerald-50/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 space-y-1 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Độ bảo mật:</span>
                    <span className={`font-bold ${passwordStrength.textClass}`}>{passwordStrength.label}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 h-1.5">
                    <div className={`rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'}`} />
                    <div className={`rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'}`} />
                    <div className={`rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'}`} />
                  </div>
                </div>
              )}

              {touched.password && errors.password && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* 5. Confirm Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Xác nhận lại mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Nhập lại mật khẩu"
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm placeholder-slate-400 outline-none transition-all ${
                    touched.confirmPassword && errors.confirmPassword
                      ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : touched.confirmPassword && !errors.confirmPassword
                      ? 'border-emerald-400 bg-emerald-50/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* 6. Terms checkbox */}
            <div className="pt-1">
              <div className="flex items-center">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="agree-terms" className="ml-2 block text-xs text-slate-600 cursor-pointer select-none">
                  Tôi đồng ý với <a href="#terms" className="text-blue-600 font-semibold underline">Điều khoản dịch vụ</a> và Chính sách bảo mật
                </label>
              </div>
              {!agreeTerms && (
                <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.agreeTerms}</span>
                </p>
              )}
            </div>

            {/* 7. Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang tạo tài khoản...</span>
                  </>
                ) : (
                  <span>Đăng ký tài khoản</span>
                )}
              </button>
            </div>
          </form>

          {/* Link to Login */}
          <div className="mt-6 text-center text-xs text-slate-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500">
              Đăng nhập ngay
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
