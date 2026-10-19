import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Briefcase, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Phone, 
  Mail, 
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import bookingApi from '../../api/bookingApi';
import MarketTab from './tabs/MarketTab';
import ScheduleTab from './tabs/ScheduleTab';
import WalletTab from './tabs/WalletTab';
import KycTab from './tabs/KycTab';

const HelperProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('market'); // 'market' | 'my-jobs' | 'wallet' | 'kyc'
  const [myBookings, setMyBookings] = useState([]);

  const fetchMyBookings = useCallback(async () => {
    try {
      const data = await bookingApi.getBookings();
      setMyBookings(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách ca của tôi:', err);
    }
  }, []);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const helperNav = [
    { key: 'market', label: 'Chợ việc làm mới', active: activeTab === 'market', onClick: () => setActiveTab('market'), icon: Briefcase },
    { key: 'my-jobs', label: 'Lịch ca đã nhận', active: activeTab === 'my-jobs', onClick: () => setActiveTab('my-jobs'), icon: Calendar, badge: myBookings.length > 0 ? `${myBookings.length}` : null },
    { key: 'wallet', label: 'Ví & Thu nhập', active: activeTab === 'wallet', onClick: () => setActiveTab('wallet'), icon: CreditCard },
    { key: 'kyc', label: 'Xác minh CCCD (KYC)', active: activeTab === 'kyc', onClick: () => setActiveTab('kyc'), icon: ShieldCheck, badge: user?.kycLevel === 2 ? 'Cấp 2' : 'Cấp 1' },
  ];

  const isLevel2 = (user?.kycLevel || 1) >= 2;

  return (
    <DashboardLayout
      roleBadge="Người giúp việc"
      roleColor="blue"
      sidebarNav={helperNav}
      activeTab={activeTab}
      onTabChange={(tabKey) => setActiveTab(tabKey)}
      pageTitle="Trang quản lý Cộng tác viên"
      pageSubtitle="Nhận việc linh hoạt, thực hiện ca và quản lý ví thu nhập"
    >
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'}
            alt={user?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{user?.name}</h1>
              {isLevel2 ? (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Cấp 2 (Verified Pro)
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                  Cấp 1 (Chưa xác minh)
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}</span>
              {user?.phone && <span>•</span>}
              {user?.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {user?.phone}</span>}
            </div>
          </div>
        </div>

        {/* Action quick tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('market')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'market' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chợ việc làm
          </button>
          <button
            onClick={() => setActiveTab('my-jobs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my-jobs' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lịch ca ({myBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wallet' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ví thu nhập
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'kyc' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hồ sơ KYC
          </button>
        </div>
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'market' && (
        <MarketTab
          user={user}
          onJobAccepted={() => {
            fetchMyBookings();
            setActiveTab('my-jobs');
          }}
          onNavigateToKyc={() => setActiveTab('kyc')}
        />
      )}

      {activeTab === 'my-jobs' && (
        <ScheduleTab
          bookings={myBookings}
          onDataChanged={fetchMyBookings}
        />
      )}

      {activeTab === 'wallet' && (
        <WalletTab user={user} />
      )}

      {activeTab === 'kyc' && (
        <KycTab user={user} onKycUpdated={fetchMyBookings} />
      )}
    </DashboardLayout>
  );
};

export default HelperProfile;
