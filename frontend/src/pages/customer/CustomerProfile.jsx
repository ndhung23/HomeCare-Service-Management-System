import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Plus,
  Heart,
  CreditCard,
  Settings,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CustomerProfile = () => {
  const { user, bookings } = useAuth();

  const customerNav = [
    { label: 'Hồ sơ tài khoản', path: '/customer', icon: User },
    { label: 'Lịch sử đặt dịch vụ', path: '/customer', icon: Calendar, badge: '3' },
    { label: 'Người giúp việc yêu thích', path: '/customer', icon: Heart },
    { label: 'Phương thức thanh toán', path: '/customer', icon: CreditCard },
    { label: 'Đánh giá đã gửi', path: '/customer', icon: Star },
    { label: 'Cài đặt tài khoản', path: '/customer', icon: Settings },
  ];

  return (
    <DashboardLayout
      roleBadge="Khách hàng (/customer)"
      roleColor="blue"
      sidebarNav={customerNav}
      pageTitle="Trang cá nhân Khách hàng"
      pageSubtitle="Theo dõi lịch sử đơn dịch vụ và quản lý thông tin gia đình"
    >
      {/* Profile Info Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img 
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'} 
            alt="Customer avatar" 
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-blue-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {user?.name || 'Trần Văn Hoàng'}
              </h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-100">
                Khách hàng thân thiết
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email || 'khachhang@gmail.com'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> 0987 654 321
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Đống Đa, Hà Nội
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/#services" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Đặt người giúp việc</span>
          </Link>
        </div>
      </div>

      {/* Booking History List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Lịch sử đặt dịch vụ của bạn
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Theo dõi trạng thái các ca giúp việc bạn đã đặt</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
            3 dịch vụ gần đây
          </span>
        </div>

        <div className="space-y-4">
          {bookings && bookings.map((item) => (
            <div key={item.id} className="p-5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{item.service}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      item.status === 'Đã hoàn thành' ? 'bg-emerald-50 text-emerald-700' :
                      item.status === 'Sắp diễn ra' ? 'bg-blue-50 text-blue-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {item.date} lúc {item.time}
                    </span>
                    <span>•</span>
                    <span>Người làm: <strong>{item.helper}</strong></span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Địa chỉ: {item.address}
                  </div>
                </div>
              </div>
              <div className="text-right sm:self-center">
                <div className="font-black text-slate-900 text-lg">{item.price}</div>
                <button className="text-xs text-blue-600 font-bold hover:underline mt-0.5">
                  Chi tiết ca
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfile;
