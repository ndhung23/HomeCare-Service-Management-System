import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, LogOut, LayoutDashboard, User, Settings, ChevronDown, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="gv-header w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1 shadow-sm overflow-hidden">
              <img 
                src={`${process.env.PUBLIC_URL}/logo.png`} 
                alt="GiúpViệc24 Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-none">
                GiúpViệc<span className="text-blue-600">24</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium tracking-wide mt-1">
                Nhà sạch • Cuộc sống tốt hơn
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px]">
            <Link 
              to="/" 
              className={`gv-nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Trang chủ
            </Link>
            <Link 
              to="/services" 
              className={`gv-nav-link ${location.pathname === '/services' ? 'active' : ''}`}
            >
              Dịch vụ
            </Link>
            <Link 
              to="/about" 
              className={`gv-nav-link ${location.pathname === '/about' ? 'active' : ''}`}
            >
              Về chúng tôi
            </Link>
            <Link 
              to="/reviews" 
              className={`gv-nav-link ${location.pathname === '/reviews' ? 'active' : ''}`}
            >
              Đánh giá
            </Link>
            <Link 
              to="/news" 
              className={`gv-nav-link ${location.pathname === '/news' ? 'active' : ''}`}
            >
              Tin tức
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button 
              className="p-2 rounded-full text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              aria-label="Tìm kiếm"
            >
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              /* User logged in state with hover dropdown */
              <div className="relative group py-2">
                <button 
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 transition-all text-left focus:outline-none"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-blue-400"
                  />
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {user.name?.split(' ')[0] || user.name}
                    </div>
                    <div className="text-[10px] text-blue-700 font-semibold leading-tight">
                      {user.roleName || user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:rotate-180 transition-transform duration-200 ml-0.5" />
                </button>

                {/* Dropdown Menu on Hover */}
                <div className="absolute right-0 top-full pt-1.5 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 text-slate-700">
                    
                    {/* User Profile Card Header */}
                    <div className="p-3 border-b border-slate-100 flex items-center gap-3">
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover border border-blue-400 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {user.email}
                        </div>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                          {user.roleName || user.role}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                      {/* Vào Dashboard quản lý đúng theo Role */}
                      <Link
                        to={user.dashboardPath || '/customer'}
                        className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl text-blue-700 bg-blue-50/70 hover:bg-blue-100 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        <span>
                          {user.role === 'admin' ? 'Bảng điều khiển Admin (/admin)' :
                           user.role === 'enterprise' ? 'Quản lý Doanh nghiệp (/enterprise)' :
                           user.role === 'helper' ? 'Lịch làm & Thu nhập (/helper)' :
                           'Quản lý đơn & Hồ sơ (/customer)'}
                        </span>
                      </Link>

                      {/* 1. Thông tin cá nhân */}
                      <Link
                        to={user.dashboardPath || '/customer'}
                        className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Thông tin cá nhân</span>
                      </Link>

                      {/* 2. Cài đặt */}
                      <button
                        type="button"
                        onClick={() => alert('Cài đặt tài khoản')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Cài đặt</span>
                      </button>

                      {/* Đổi role test */}
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl text-amber-600 hover:bg-amber-50 transition-colors text-left"
                      >
                        <RotateCw className="w-4 h-4 text-amber-500" />
                        <span>Đổi role khác test</span>
                      </button>
                    </div>

                    {/* 3. Thoát */}
                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Thoát</span>
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              /* Guest state: Login / Register */
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all"
                >
                  Đăng ký
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
