import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Briefcase, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Phone, 
  Mail, 
  UserCheck,
  Wallet,
  ArrowUpRight,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import bookingApi from '../../api/bookingApi';
import walletApi from '../../api/walletApi';
import { formatVND } from '../../utils/serviceUtils';
import MarketTab from './tabs/MarketTab';
import ScheduleTab from './tabs/ScheduleTab';
import WalletTab from './tabs/WalletTab';
import KycTab from './tabs/KycTab';
import ProfileSettingsTab from './tabs/ProfileSettingsTab';

const HelperProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('market'); // 'market' | 'my-jobs' | 'wallet' | 'kyc'
  const [myBookings, setMyBookings] = useState([]);
  const [walletInfo, setWalletInfo] = useState({ available: 0, locked: 0, bank: {} });

  const fetchMyBookings = useCallback(async () => {
    try {
      const data = await bookingApi.getBookings();
      setMyBookings(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách ca của tôi:', err);
    }
  }, []);

  const fetchWallet = useCallback(async () => {
    try {
      const data = await walletApi.getMyWallet();
      setWalletInfo(data || { available: 0, locked: 0, bank: {} });
    } catch (err) {
      console.error('Lỗi tải thông tin ví:', err);
    }
  }, []);

  useEffect(() => {
    fetchMyBookings();
    fetchWallet();
  }, [fetchMyBookings, fetchWallet]);

  const helperNav = [
    { key: 'market', label: 'Chợ việc làm mới', active: activeTab === 'market', onClick: () => setActiveTab('market'), icon: Briefcase },
    { key: 'my-jobs', label: 'Lịch ca đã nhận', active: activeTab === 'my-jobs', onClick: () => setActiveTab('my-jobs'), icon: Calendar, badge: myBookings.length > 0 ? `${myBookings.length}` : null },
    { 
      key: 'wallet', 
      label: 'Ví & Thu nhập', 
      active: activeTab === 'wallet', 
      onClick: () => setActiveTab('wallet'), 
      icon: CreditCard,
      badge: (walletInfo.available || 0) > 0 ? formatVND(walletInfo.available) : null,
      badgeColor: 'emerald'
    },
    { key: 'kyc', label: 'Xác minh CCCD (KYC)', active: activeTab === 'kyc', onClick: () => setActiveTab('kyc'), icon: ShieldCheck, badge: user?.kycLevel === 2 ? 'Cấp 2' : 'Cấp 1' },
    {
      key: 'settings',
      label: 'Cài đặt hồ sơ',
      active: activeTab === 'settings',
      onClick: () => setActiveTab('settings'),
      icon: Settings,
      badge: user?.pendingProfileUpdate?.status === 'PENDING' ? 'Chờ duyệt' : null,
      badgeColor: 'amber',
    },
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
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
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

        {/* Right side: Wallet Snapshot Card & Navigation tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Quick Wallet Widget */}
          <div
            onClick={() => setActiveTab('wallet')}
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)' }}
            className="text-white px-4 py-2.5 rounded-2xl shadow-md flex items-center justify-between sm:justify-start gap-3.5 transition-all cursor-pointer group border border-blue-400/30 hover:brightness-110"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 group-hover:bg-white/30 flex items-center justify-center transition-colors shrink-0">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
                <span>Số dư ví</span>
                {(walletInfo.locked || 0) > 0 && (
                  <span className="bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full font-black text-[9px]">
                    Khóa: {formatVND(walletInfo.locked)}
                  </span>
                )}
              </div>
              <div className="text-base font-black text-white font-mono leading-tight">
                {formatVND(walletInfo.available || 0)}
              </div>
            </div>
            <div className="pl-2 border-l border-white/25">
              <span className="px-2.5 py-1 bg-white text-blue-700 group-hover:bg-blue-50 text-[11px] font-extrabold rounded-lg shadow-sm transition-all flex items-center gap-1">
                <span>Rút</span>
                <ArrowUpRight className="w-3 h-3 text-blue-700" />
              </span>
            </div>
          </div>

          {/* Action quick tabs */}
          <div className="flex flex-wrap gap-1 p-1.5 bg-slate-100 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab('market')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'market' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chợ việc làm
            </button>
            <button
              onClick={() => setActiveTab('my-jobs')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'my-jobs' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lịch ca ({myBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'wallet' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Ví thu nhập</span>
              {(walletInfo.available || 0) > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('kyc')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'kyc' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hồ sơ KYC
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'settings' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Cài đặt hồ sơ</span>
              {user?.pendingProfileUpdate?.status === 'PENDING' && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'market' && (
        <MarketTab
          user={user}
          onJobAccepted={() => {
            fetchMyBookings();
            fetchWallet();
            setActiveTab('my-jobs');
          }}
          onNavigateToKyc={() => setActiveTab('kyc')}
        />
      )}

      {activeTab === 'my-jobs' && (
        <ScheduleTab
          bookings={myBookings}
          onDataChanged={() => {
            fetchMyBookings();
            fetchWallet();
          }}
        />
      )}

      {activeTab === 'wallet' && (
        <WalletTab 
          user={user} 
          onWalletChanged={fetchWallet} 
        />
      )}

      {activeTab === 'kyc' && (
        <KycTab user={user} onKycUpdated={fetchMyBookings} />
      )}

      {activeTab === 'settings' && (
        <ProfileSettingsTab
          user={user}
          onUserUpdated={() => {
            fetchMyBookings();
            fetchWallet();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default HelperProfile;
