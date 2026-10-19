import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Lock, Mail, X, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import authApi from '../api/authApi';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [forgotStatus, setForgotStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    setIsLoading(true);
    try {
      const loggedUser = await login(email.trim(), password);
      navigate(loggedUser.redirectPath || loggedUser.dashboardPath || '/');
    } catch (err) {
      console.error('Đăng nhập thất bại:', err);
      const apiMessage = err.response?.data?.message || 'Email hoặc mật khẩu không chính xác!';
      setErrorMessage(apiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForgot = (e) => {
    e.preventDefault();
    setForgotEmail(email.trim() || '');
    setForgotStatus({ type: '', message: '' });
    setShowForgotModal(true);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotStatus({ type: 'error', message: 'Vui lòng nhập địa chỉ email của bạn!' });
      return;
    }

    setIsSendingForgot(true);
    setForgotStatus({ type: '', message: '' });
    try {
      const res = await authApi.forgotPassword(forgotEmail.trim());
      setForgotStatus({
        type: 'success',
        message: res.message || 'Đã gửi liên kết khôi phục mật khẩu! Vui lòng kiểm tra hộp thư của bạn.',
      });
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu quên mật khẩu:', err);
      const msg = err.response?.data?.message || 'Không thể gửi email lúc này. Vui lòng kiểm tra lại cấu hình SMTP!';
      setForgotStatus({ type: 'error', message: msg });
    } finally {
      setIsSendingForgot(false);
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
            Đăng nhập để quản lý dịch vụ và đơn hàng của bạn
          </p>
        </div>

        {/* Regular Login Form */}
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-slate-100 sm:px-8">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email hoặc Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
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
                Mật khẩu <span className="text-red-500">*</span>
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
                  placeholder="Nhập mật khẩu (demo: 123)"
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
                <button
                  type="button"
                  onClick={handleOpenForgot}
                  className="font-semibold text-blue-600 hover:text-blue-500 cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Khôi phục mật khẩu
                  </h3>
                  <p className="text-[11px] text-slate-400">GiúpViệc24 xác thực qua email</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Nhập địa chỉ email tài khoản của bạn. Hệ thống sẽ gửi một liên kết an toàn kèm hướng dẫn để bạn đặt lại mật khẩu mới.
              </p>

              {forgotStatus.message && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium mb-4 flex items-start gap-2 ${
                    forgotStatus.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {forgotStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span>{forgotStatus.message}</span>
                </div>
              )}

              {forgotStatus.type === 'success' ? (
                <div className="space-y-3 pt-2">
                  <p className="text-[11px] text-slate-400 text-center">
                    Không nhận được email? Hãy kiểm tra hòm thư Rác (Spam) hoặc thử gửi lại.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStatus({ type: '', message: '' });
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Gửi lại liên kết khác
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    Quay lại Đăng nhập
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ Email tài khoản <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingForgot}
                      className="w-1/2 py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {isSendingForgot ? 'Đang gửi mail...' : 'Gửi liên kết'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
