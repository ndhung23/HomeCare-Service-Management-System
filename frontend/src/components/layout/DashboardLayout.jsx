import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LogOut, 
  Home, 
  RotateCw,
  Bell,
  Search,
  User,
  Settings,
  ChevronDown
} from 'lucide-react';

const DashboardLayout = ({ 
  roleBadge, 
  roleColor = 'blue', 
  sidebarNav = [], 
  children,
  pageTitle,
  pageSubtitle
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBadgeStyle = () => {
    switch (roleColor) {
      case 'indigo':
        return 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50';
      case 'amber':
        return 'bg-amber-900/40 text-amber-300 border-amber-700/50';
      case 'emerald':
        return 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50';
      default:
        return 'bg-blue-900/40 text-blue-300 border-blue-700/50';
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col lg:grid lg:grid-cols-12 overflow-x-hidden">
      
      {/* ================= LEFT SIDEBAR (2 COLS) ================= */}
      <aside className="lg:col-span-2 bg-[#0b132b] text-slate-300 flex flex-col justify-between border-r border-slate-800/80 lg:min-h-screen sticky top-0 z-40">
        
        {/* Top brand & profile */}
        <div>
          {/* Brand Logo */}
          <div className="p-5 border-b border-slate-800/80">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                <img 
                  src={`${process.env.PUBLIC_URL}/logo.png`} 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="text-lg font-black text-white leading-none tracking-tight">
                  GiúpViệc<span className="text-blue-500">24</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
                  Hệ thống quản trị
                </div>
              </div>
            </Link>
          </div>

          {/* User Profile Mini Card in Sidebar */}
          <div className="p-3.5 mx-3 my-4 rounded-2xl bg-[#1c2541]/70 border border-slate-700/50 shadow-xs">
            <div className="flex items-center gap-3">
              <img 
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'} 
                alt={user?.name} 
                className="w-10 h-10 rounded-xl object-cover border border-slate-600 shrink-0"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name || 'Người dùng'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {user?.email}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}>
                {roleBadge}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Trực tuyến
              </span>
            </div>
          </div>

          {/* Navigation Links (Left 2 - Elegant SaaS style) */}
          <nav className="px-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Chức năng chính
            </div>
            {sidebarNav.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive 
                        ? 'bg-white text-blue-600' 
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions in Sidebar */}
        <div className="p-3 border-t border-slate-800/80 space-y-1">
          {/* Quick Role Switcher Button for Testing */}
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-300 hover:bg-amber-500/10 transition-colors"
          >
            <RotateCw className="w-4 h-4 text-amber-400" />
            <span>Đổi role khác test</span>
          </button>

          {/* Back to Home Button */}
          <Link
            to="/"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Thoát tài khoản</span>
          </button>
        </div>
      </aside>

      {/* ================= RIGHT MAIN CONTENT (10 COLS) ================= */}
      <div className="lg:col-span-10 flex flex-col min-h-screen w-full bg-slate-50">
        
        {/* Top Header of Right Area */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          
          {/* Left Title & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                {pageTitle}
              </div>
              {pageSubtitle && (
                <div className="text-xs text-slate-500 leading-none mt-0.5">
                  {pageSubtitle}
                </div>
              )}
            </div>
          </div>

          {/* Right quick search, notification & Hover User Menu */}
          <div className="flex items-center gap-3">
            
            {/* Quick search input */}
            <div className="relative hidden md:block w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm dữ liệu..." 
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Notification bell */}
            <button 
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 relative transition-colors"
              aria-label="Thông báo"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2"></span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            {/* User Dropdown Trigger on Hover */}
            <div className="relative group py-2">
              <button 
                type="button"
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <img 
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-slate-200"
                />
                <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-[120px] truncate">
                  {user?.name?.split(' ')[0] || user?.name || 'User'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:rotate-180 transition-transform duration-200" />
              </button>

              {/* Dropdown Menu on Hover */}
              <div className="absolute right-0 top-full pt-1 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 text-slate-700 animate-in fade-in slide-in-from-top-2">
                  
                  {/* User Profile Card Header in Dropdown */}
                  <div className="p-3 border-b border-slate-100 flex items-center gap-3">
                    <img 
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full object-cover border border-blue-400 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {user?.name || 'Người dùng'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {user?.email}
                      </div>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {user?.roleName || user?.role}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Navigation Actions */}
                  <div className="py-1">
                    {/* 1. Thông tin cá nhân */}
                    <Link
                      to={user?.dashboardPath || '/customer'}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
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

                    {/* Quick switch test role */}
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl text-amber-600 hover:bg-amber-50 transition-colors text-left"
                    >
                      <RotateCw className="w-4 h-4 text-amber-500" />
                      <span>Đổi role khác test</span>
                    </button>
                  </div>

                  {/* 3. Thoát (Đăng xuất) */}
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Thoát</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>

        </header>

        {/* Dynamic Page Content (Full width 10 cols) */}
        <main className="p-4 sm:p-8 flex-1 w-full">
          {children}
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;
