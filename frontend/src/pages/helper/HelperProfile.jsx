import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  UserCheck, 
  Star, 
  CheckCircle, 
  Calendar, 
  MapPin, 
  DollarSign, 
  ShieldCheck,
  Clock,
  Award,
  Bell
} from 'lucide-react';

const HelperProfile = () => {
  const helperNav = [
    { label: 'Hồ sơ người giúp việc', path: '/helper', icon: UserCheck },
    { label: 'Lịch nhận việc & Ca hẹn', path: '/helper', icon: Calendar, badge: '2' },
    { label: 'Ví thu nhập & Rút tiền', path: '/helper', icon: DollarSign },
    { label: 'Đánh giá & Phản hồi', path: '/helper', icon: Star },
    { label: 'Chứng chỉ & Kỹ năng', path: '/helper', icon: Award },
    { label: 'Thông báo nhận việc', path: '/helper', icon: Bell },
  ];

  return (
    <DashboardLayout
      roleBadge="Người giúp việc (/helper)"
      roleColor="emerald"
      sidebarNav={helperNav}
      pageTitle="Trang cá nhân Người giúp việc"
      pageSubtitle="Quản lý lịch nhận việc, mức lương và phản hồi đánh giá của khách hàng"
    >
      {/* Profile Card Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" 
                alt="Helper profile" 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
              />
              <span className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                <CheckCircle className="w-4 h-4" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  Nguyễn Thị Lan
                </h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Đã xác minh lý lịch
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-slate-700 font-semibold">
                  <MapPin className="w-4 h-4 text-slate-400" /> Cầu Giấy, Hà Nội
                </span>
                <span>•</span>
                <span>Kinh nghiệm: 3 năm</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-bold text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" /> 4.9 (56 đánh giá)
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">Dọn dẹp nhà</span>
                <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">Nấu ăn gia đình</span>
                <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">Chăm sóc trẻ em</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
            <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Đơn giá theo giờ</div>
            <div className="text-2xl font-black text-emerald-800 mt-0.5">120.000đ / giờ</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Đã bao gồm bảo hiểm an toàn</div>
          </div>
        </div>
      </div>

      {/* Quick Earnings & Job Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Thu nhập tháng này</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">12.450.000đ</div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Đã hoàn thành 26 ca làm việc</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Lịch hẹn hôm nay</span>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">2 ca hẹn</div>
          <p className="text-xs text-slate-500 mt-1">Ca kế tiếp lúc 14:00 (Dọn dẹp nhà)</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Trạng thái nhận việc</span>
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">Đang bật</div>
          <p className="text-xs text-slate-500 mt-1">Khách hàng có thể đặt lịch ngay lập tức</p>
        </div>
      </div>

      {/* Upcoming Bookings List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Lịch làm việc sắp tới của bạn
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Vui lòng có mặt trước giờ hẹn ít nhất 10 phút</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
            2 ca hẹn cần thực hiện
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                  Hôm nay, 14:00 - 17:00
                </span>
                <span className="text-xs font-semibold text-slate-500">3 tiếng</span>
              </div>
              <h4 className="font-bold text-slate-900 text-base mt-1.5">Dọn dẹp căn hộ 2 phòng ngủ</h4>
              <p className="text-xs text-slate-600 mt-0.5">Địa chỉ: Chung cư Vinhomes D’Capitale, Trần Duy Hưng, Hà Nội</p>
              <p className="text-xs text-slate-400 mt-0.5">Khách hàng: Anh Minh (0912 *** 889)</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-slate-900">360.000đ</div>
              <button className="mt-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700">
                Xem chi tiết ca
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                  Ngày mai, 08:30 - 11:30
                </span>
                <span className="text-xs font-semibold text-slate-500">3 tiếng</span>
              </div>
              <h4 className="font-bold text-slate-900 text-base mt-1.5">Nấu ăn gia đình & dọn dẹp bếp</h4>
              <p className="text-xs text-slate-600 mt-0.5">Địa chỉ: Phố Duy Tân, Dịch Vọng Hậu, Cầu Giấy</p>
              <p className="text-xs text-slate-400 mt-0.5">Khách hàng: Chị Lan Anh (0983 *** 122)</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-slate-900">360.000đ</div>
              <button className="mt-1.5 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50">
                Xem chi tiết ca
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelperProfile;
