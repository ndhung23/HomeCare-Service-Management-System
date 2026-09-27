import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, ChevronRight, ArrowRight } from 'lucide-react';

const SERVICE_LINKS = [
  'Dọn dẹp nhà theo giờ',
  'Nấu ăn gia đình',
  'Chăm sóc trẻ nhỏ',
  'Chăm sóc người già',
  'Giặt ủi - Là quần áo',
  'Gói định kỳ & tổng vệ sinh',
];

const COMPANY_LINKS = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Dịch vụ', to: '/services' },
  { label: 'Người giúp việc', to: '/helpers' },
  { label: 'Về chúng tôi', to: '/about' },
  { label: 'Đánh giá khách hàng', to: '/reviews' },
  { label: 'Tin tức & mẹo hay', to: '/news' },
];

const ACCOUNT_LINKS = [
  { label: 'Đăng nhập', to: '/login' },
  { label: 'Đăng ký tài khoản', to: '/register' },
  { label: 'Trang quản lý của tôi', to: '/profile' },
];

/**
 * Footer dùng chung cho các trang public (Home, Dịch vụ, Người giúp việc, ...).
 */
const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">

          {/* Thương hiệu */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src={`${process.env.PUBLIC_URL}/logo.png`}
                  alt="GiúpViệc24 Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="text-xl font-black text-white leading-none tracking-tight">
                  GiúpViệc<span className="text-blue-500">24</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium tracking-wide mt-1">
                  Nhà sạch • Cuộc sống tốt hơn
                </div>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed mt-4 max-w-sm">
              Nền tảng đặt người giúp việc theo giờ: dọn dẹp nhà cửa, nấu ăn, chăm sóc trẻ nhỏ và người cao
              tuổi. Đội ngũ đã qua xác minh lý lịch, kiểm tra tay nghề và được bảo hiểm trách nhiệm trong
              mỗi ca làm việc.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/70 text-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lý lịch đã xác minh</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/70 text-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Đổi người miễn phí</span>
              </span>
            </div>
          </div>

          {/* Dịch vụ */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Dịch vụ</h3>
            <ul className="space-y-2.5">
              {SERVICE_LINKS.map((label) => (
                <li key={label}>
                  <Link
                    to="/services"
                    className="group inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Về GiúpViệc24 */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">GiúpViệc24</h3>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-xs text-slate-400 hover:text-blue-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tài khoản */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Tài khoản</h3>
            <ul className="space-y-2.5">
              {ACCOUNT_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-xs text-slate-400 hover:text-blue-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* CTA cho người giúp việc */}
            <div className="mt-6 p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/70">
              <p className="text-xs text-slate-300 font-semibold">Bạn là người giúp việc?</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Đăng ký cộng tác cùng GiúpViệc24 để nhận việc gần nhà, thu nhập minh bạch.
              </p>
              <Link
                to="/register"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all"
              >
                <span>Đăng ký làm giúp việc</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Thanh bản quyền */}
      <div className="border-t border-slate-800 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400">© 2026 GIUPVIEC24. All rights reserved.</p>
          <p className="text-[11px] text-slate-500">Nhà sạch • Cuộc sống tốt hơn</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
