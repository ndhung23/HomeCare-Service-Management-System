import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, UserCheck, Building2, ArrowLeft, Mail, Lock, Phone, Check } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !email) {
      alert('Vui lòng nhập họ tên và email để đăng ký test!');
      return;
    }
    const newUser = register({
      role,
      fullName,
      email,
      phone,
      password,
    });
    navigate(newUser.redirectPath);
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
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1 shadow-sm overflow-hidden">
              <img 
                src={`${process.env.PUBLIC_URL}/logo.png`} 
                alt="Logo GiúpViệc24" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                GiúpViệc<span className="text-blue-600">24</span>
              </div>
              <div className="text-xs text-slate-500 font-medium tracking-wide mt-1">
                Tạo tài khoản mới
              </div>
            </div>
          </Link>
          <h2 className="mt-3 text-2xl font-extrabold text-slate-900">
            Đăng ký tài khoản GiúpViệc24
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Chọn loại tài khoản phù hợp với nhu cầu của bạn
          </p>
        </div>

        {/* Role Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`relative p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon className="w-5 h-5" />
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ Email
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0987 654 321"
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tạo mật khẩu an toàn"
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center pt-1">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-xs text-slate-600">
                Tôi đồng ý với <a href="#terms" className="text-blue-600 font-semibold underline">Điều khoản dịch vụ</a> và Chính sách bảo mật
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Đăng ký tài khoản
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
