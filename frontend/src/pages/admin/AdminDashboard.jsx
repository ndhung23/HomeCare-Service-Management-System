import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Users, 
  Building2, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  LayoutDashboard,
  ShieldCheck,
  Settings,
  FileText
} from 'lucide-react';

const AdminDashboard = () => {
  const adminNav = [
    { label: 'Tổng quan hệ thống', path: '/admin', icon: LayoutDashboard },
    { label: 'Quản lý Người giúp việc', path: '/admin', icon: Users, badge: '14' },
    { label: 'Đối tác Doanh nghiệp', path: '/admin', icon: Building2 },
    { label: 'Duyệt hồ sơ & CCCD', path: '/admin', icon: ShieldCheck, badge: 'Mới' },
    { label: 'Báo cáo & Thống kê', path: '/admin', icon: FileText },
    { label: 'Cài đặt hệ thống', path: '/admin', icon: Settings },
  ];

  return (
    <DashboardLayout
      roleBadge="Admin (/admin)"
      roleColor="indigo"
      sidebarNav={adminNav}
      pageTitle="Bảng điều khiển Quản trị viên"
      pageSubtitle="Giám sát & Quản lý toàn bộ hệ sinh thái GiúpViệc24"
    >
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng người giúp việc</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">1,248</div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +12% so với tháng trước
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Đối tác Doanh nghiệp</span>
            <Building2 className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">86</div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> 84 doanh nghiệp đã duyệt
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Lịch hẹn hoàn thành</span>
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">5,820</div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 98.6% tỷ lệ hài lòng
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Cần duyệt hồ sơ</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">14</div>
          <div className="text-xs text-rose-500 font-semibold mt-2">
            Hồ sơ lý lịch đang chờ xác thực
          </div>
        </div>
      </div>

      {/* Main Table full width */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Danh sách đăng ký người giúp việc mới nhất
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Xác minh danh tính và kiểm tra năng lực hồ sơ</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
            Hiển thị dữ liệu mẫu
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Họ tên</th>
                <th className="py-3.5 px-6">Khu vực</th>
                <th className="py-3.5 px-6">Kinh nghiệm</th>
                <th className="py-3.5 px-6">Trạng thái</th>
                <th className="py-3.5 px-6">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="py-4 px-6 font-semibold text-slate-900">Nguyễn Thị Lan</td>
                <td className="py-4 px-6 text-slate-600">Cầu Giấy, Hà Nội</td>
                <td className="py-4 px-6 text-slate-600">3 năm</td>
                <td className="py-4 px-6">
                  <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold">
                    Đã xác minh
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button className="text-xs font-bold text-blue-600 hover:underline">Chi tiết</button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-4 px-6 font-semibold text-slate-900">Trần Thị Hương</td>
                <td className="py-4 px-6 text-slate-600">Bình Thạnh, TP.HCM</td>
                <td className="py-4 px-6 text-slate-600">5 năm</td>
                <td className="py-4 px-6">
                  <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold">
                    Đã xác minh
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button className="text-xs font-bold text-blue-600 hover:underline">Chi tiết</button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-4 px-6 font-semibold text-slate-900">Hoàng Thị Thảo</td>
                <td className="py-4 px-6 text-slate-600">Đống Đa, Hà Nội</td>
                <td className="py-4 px-6 text-slate-600">2 năm</td>
                <td className="py-4 px-6">
                  <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold">
                    Chờ duyệt CCCD
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button className="text-xs font-bold text-blue-600 hover:underline">Phê duyệt</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
