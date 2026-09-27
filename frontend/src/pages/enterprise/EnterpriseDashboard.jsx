import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Building2, 
  Users, 
  CalendarCheck, 
  DollarSign, 
  PlusCircle,
  Clock,
  Briefcase,
  FileCheck,
  Settings
} from 'lucide-react';

const EnterpriseDashboard = () => {
  const enterpriseNav = [
    { label: 'Bàn làm việc Doanh nghiệp', path: '/enterprise', icon: Building2 },
    { label: 'Đội ngũ Người giúp việc', path: '/enterprise', icon: Users, badge: '42' },
    { label: 'Lịch ca & Hợp đồng', path: '/enterprise', icon: CalendarCheck },
    { label: 'Quản lý Dịch vụ cung cấp', path: '/enterprise', icon: Briefcase },
    { label: 'Báo cáo Doanh thu', path: '/enterprise', icon: FileCheck },
    { label: 'Cài đặt Doanh nghiệp', path: '/enterprise', icon: Settings },
  ];

  return (
    <DashboardLayout
      roleBadge="Doanh nghiệp (/enterprise)"
      roleColor="amber"
      sidebarNav={enterpriseNav}
      pageTitle="Quản trị Đối tác Doanh nghiệp"
      pageSubtitle="Điều phối nhân sự giúp việc và quản lý lịch thực hiện dịch vụ"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-block bg-white/20 text-xs font-bold px-3 py-1 rounded-full mb-2">
            Đối tác Doanh Nghiệp
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Công ty Dịch vụ Vệ sinh CleanPro
          </h1>
          <p className="text-amber-100 text-sm mt-1 max-w-xl">
            Quản lý đội ngũ nhân sự giúp việc, phân phối ca làm việc và theo dõi hiệu suất công việc.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-white text-slate-900 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-slate-50 flex items-center gap-1.5 transition-all">
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>Thêm nhân sự mới</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Nhân sự thuộc công ty</span>
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">42 người</div>
          <p className="text-xs text-slate-500 mt-1">38 người đang trực tuyến nhận ca</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Lịch hẹn đang thực hiện</span>
            <CalendarCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">18 ca</div>
          <p className="text-xs text-blue-600 font-semibold mt-1">Tất cả nhân sự đúng giờ</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Doanh thu tháng này</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">84.500.000đ</div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">+18.4% tăng trưởng</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Thời gian đáp ứng TB</span>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">15 phút</div>
          <p className="text-xs text-slate-500 mt-1">Từ lúc khách gửi yêu cầu</p>
        </div>
      </div>

      {/* Helper Assignment Demo Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Điều phối đội ngũ nhân viên giúp việc
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Trạng thái sẵn sàng và các ca đang thực hiện</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
            Dữ liệu mẫu demo
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center">
                ML
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Mai Thị Liên</div>
                <div className="text-xs text-slate-500">Chuyên môn: Dọn dẹp công nghiệp, giặt ủi</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold">
                Đang rảnh (Sẵn sàng nhận ca)
              </span>
              <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold">
                Giao ca
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                TH
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Trần Văn Hùng</div>
                <div className="text-xs text-slate-500">Chuyên môn: Sửa chữa điện nước gia đình, vệ sinh máy lạnh</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold">
                Đang làm việc (Quận 1, hoàn thành lúc 16:30)
              </span>
              <button className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold">
                Theo dõi
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EnterpriseDashboard;
