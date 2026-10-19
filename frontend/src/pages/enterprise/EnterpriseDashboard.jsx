import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Building2, 
  Users, 
  CalendarCheck, 
  DollarSign, 
  Clock, 
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import bookingApi from '../../api/bookingApi';
import authApi from '../../api/authApi';
import walletApi from '../../api/walletApi';
import { formatVND } from '../../utils/serviceUtils';

import MarketTab from './tabs/MarketTab';
import ScheduleTab from './tabs/ScheduleTab';
import EmployeesTab from './tabs/EmployeesTab';
import WalletTab from './tabs/WalletTab';

const EnterpriseDashboard = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);
  const [activeTab, setActiveTab] = useState('MARKET'); // 'MARKET' | 'SCHEDULE' | 'EMPLOYEES' | 'WALLET'
  const [openBookings, setOpenBookings] = useState([]);
  const [companyBookings, setCompanyBookings] = useState([]);
  const [walletData, setWalletData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const employees = currentUser?.employees || user?.employees || [];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [marketRes, allBookingsRes, meRes, wRes] = await Promise.allSettled([
        bookingApi.getMarketBookings(),
        bookingApi.getBookings(),
        authApi.getMe(),
        walletApi.getWallet(),
      ]);

      if (marketRes.status === 'fulfilled' && Array.isArray(marketRes.value)) {
        setOpenBookings(marketRes.value);
      }
      if (allBookingsRes.status === 'fulfilled' && Array.isArray(allBookingsRes.value)) {
        const myCompanyId = user?.id || user?._id;
        const myName = user?.name || '';
        setCompanyBookings(
          allBookingsRes.value.filter((b) => {
            return (
              b.assigneeId === myCompanyId ||
              b.acceptedBy === myCompanyId ||
              b.workerId === myCompanyId ||
              (b.helper && myName && b.helper.includes(myName)) ||
              (b.helper && b.helper.includes('CleanPro'))
            );
          })
        );
      }
      if (meRes.status === 'fulfilled' && meRes.value?.user) {
        setCurrentUser(meRes.value.user);
      }
      if (wRes.status === 'fulfilled') {
        setWalletData(wRes.value);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu doanh nghiệp:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const enterpriseNav = [
    { key: 'MARKET', label: 'Chợ nhận việc B2B', active: activeTab === 'MARKET', onClick: () => setActiveTab('MARKET'), icon: Building2, badge: openBookings.length > 0 ? `${openBookings.length}` : null },
    { key: 'SCHEDULE', label: 'Lịch ca & Hợp đồng', active: activeTab === 'SCHEDULE', onClick: () => setActiveTab('SCHEDULE'), icon: CalendarCheck, badge: companyBookings.length > 0 ? `${companyBookings.length}` : null },
    { key: 'EMPLOYEES', label: 'Đội ngũ Nhân sự B2B', active: activeTab === 'EMPLOYEES', onClick: () => setActiveTab('EMPLOYEES'), icon: Users, badge: employees.length > 0 ? `${employees.length}` : null },
    { key: 'WALLET', label: 'Ví & Doanh thu Sàn', active: activeTab === 'WALLET', onClick: () => setActiveTab('WALLET'), icon: DollarSign },
  ];

  const availableBalance = walletData?.wallet?.available ?? (currentUser?.wallet?.available || 0);

  return (
    <DashboardLayout
      roleBadge="Doanh nghiệp B2B"
      roleColor="amber"
      sidebarNav={enterpriseNav}
      activeTab={activeTab}
      onTabChange={(tabKey) => setActiveTab(tabKey)}
      pageTitle="Quản trị Đối tác Doanh nghiệp"
      pageSubtitle="Nhận ca từ sàn, phân công nhân sự và quyết toán doanh thu chiết khấu 12%"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-block bg-white/20 text-xs font-bold px-3 py-1 rounded-full mb-2">
            Đối tác Doanh Nghiệp B2B
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {currentUser?.name || user?.name || 'Công ty Dịch vụ Vệ sinh CleanPro'}
          </h1>
          <p className="text-amber-100 text-sm mt-1 max-w-xl">
            Nhận ca trên Chợ việc làm, gán nhân viên phụ trách và hưởng tỷ lệ thực nhận 88% (phí sàn ưu đãi 12%).
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/20 text-center">
          <div className="text-xs text-amber-200 uppercase font-semibold">Phí sàn B2B ưu đãi</div>
          <div className="text-2xl font-black text-white mt-0.5">88% Doanh thu</div>
          <div className="text-[11px] text-amber-100">Ví khả dụng: {formatVND(availableBalance)}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div 
          onClick={() => setActiveTab('EMPLOYEES')} 
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Nhân sự công ty</span>
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{employees.length} nhân viên</div>
          <p className="text-xs text-slate-500 mt-1">Sẵn sàng nhận phân công</p>
        </div>

        <div 
          onClick={() => setActiveTab('MARKET')} 
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-purple-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Đơn trên chợ chờ nhận</span>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-600">{openBookings.length} ca</div>
          <p className="text-xs text-slate-500 mt-1">Có thể bấm nhận ngay</p>
        </div>

        <div 
          onClick={() => setActiveTab('SCHEDULE')} 
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ca công ty đã nhận</span>
            <CalendarCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{companyBookings.length} ca</div>
          <p className="text-xs text-blue-600 font-semibold mt-1">Đang điều phối & thực hiện</p>
        </div>

        <div 
          onClick={() => setActiveTab('WALLET')} 
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Số dư ví khả dụng</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{formatVND(availableBalance)}</div>
          <p className="text-xs text-slate-500 mt-1">Bấm để quản lý ví & rút tiền</p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('MARKET')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'MARKET' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Chợ việc làm B2B ({openBookings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('SCHEDULE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'SCHEDULE' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Lịch ca & Hợp đồng ({companyBookings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('EMPLOYEES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'EMPLOYEES' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Đội ngũ Nhân sự ({employees.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('WALLET')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'WALLET' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Ví & Doanh thu B2B</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'MARKET' && (
        <MarketTab
          openBookings={openBookings}
          employees={employees}
          isLoading={isLoading}
          onRefresh={fetchData}
          onBookingClaimed={() => {
            fetchData();
            setActiveTab('SCHEDULE');
          }}
          onNavigateToEmployees={() => setActiveTab('EMPLOYEES')}
        />
      )}

      {activeTab === 'SCHEDULE' && (
        <ScheduleTab
          companyBookings={companyBookings}
          isLoading={isLoading}
          onRefresh={fetchData}
        />
      )}

      {activeTab === 'EMPLOYEES' && (
        <EmployeesTab
          employees={employees}
          onRefresh={fetchData}
        />
      )}

      {activeTab === 'WALLET' && (
        <WalletTab
          availableBalance={availableBalance}
          bankInfo={currentUser?.bank}
          onRefresh={fetchData}
        />
      )}
    </DashboardLayout>
  );
};

export default EnterpriseDashboard;
