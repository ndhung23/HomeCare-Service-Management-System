import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Building2, UserCheck, User, ArrowLeft, Lock, Mail, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, mockAccounts } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('customer');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      // If empty email, use the selected role's mock account
      const matched = login(selectedRole);
      navigate(matched.redirectPath);
      return;
    }
    const loggedUser = login(email, password);
    navigate(loggedUser.redirectPath);
  };

  const handleQuickLogin = (role) => {
    const loggedUser = login(role);
    navigate(loggedUser.redirectPath);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-5 h-5 text-indigo-600" />;
      case 'enterprise': return <Building2 className="w-5 h-5 text-amber-600" />;
      case 'helper': return <UserCheck className="w-5 h-5 text-emerald-600" />;
      default: return <User className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Back to Home Button */}
      <div className="max-w-md w-full mx-auto px-4 mb-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
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
                Đăng nhập tài khoản
              </div>
            </div>
          </Link>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
            Chào mừng bạn quay trở lại!
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Chọn tài khoản mẫu để test nhanh luồng hoặc nhập thông tin
          </p>
        </div>

        {/* Quick Mock Role Switcher (For Testing Roles) */}
        <div className="mb-6 bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Chọn nhanh vai trò để test luồng (1-Click)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {mockAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleQuickLogin(acc.role)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white shadow-xs">
                  {getRoleIcon(acc.role)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                    {acc.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {acc.redirectPath}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-slate-100 sm:px-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Select Role for Form */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vai trò đăng nhập
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              >
                <option value="customer">Khách hàng (Trang chủ /)</option>
                <option value="helper">Người giúp việc (/helper)</option>
                <option value="enterprise">Doanh nghiệp (/enterprise)</option>
                <option value="admin">Quản trị viên (/admin)</option>
              </select>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email hoặc Tên đăng nhập
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@giupviec24.vn hoặc email..."
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu bất kỳ (demo: 123)"
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-xs">
                <a href="#forgot" className="font-semibold text-blue-600 hover:text-blue-500">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Đăng nhập
              </button>
            </div>
          </form>

          {/* Link to Register */}
          <div className="mt-6 text-center text-xs text-slate-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500">
              Đăng ký ngay
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
