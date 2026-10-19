/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Users, 
  ShieldCheck, 
  CreditCard, 
  AlertOctagon, 
  Settings 
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import bookingApi from '../../api/bookingApi';
import OverviewAndUsersTab from './tabs/OverviewAndUsersTab';
import KycAndWorkersTab from './tabs/KycAndWorkersTab';
import PaymentsAndWithdrawsTab from './tabs/PaymentsAndWithdrawsTab';
import DisputesTab from './tabs/DisputesTab';
import PricingAndContentTab from './tabs/PricingAndContentTab';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('PAYMENT'); // 'PAYMENT' | 'KYC' | 'DISPUTES' | 'USERS' | 'PRICING'
  const [stats, setStats] = useState(null);

  // Payments & Withdraws state
  const [awaitingBookings, setAwaitingBookings] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentSubTab, setPaymentSubTab] = useState('AWAITING');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(null);
  const [withdraws, setWithdraws] = useState([]);

  // KYC state
  const [pendingKycList, setPendingKycList] = useState([]);

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  const fetchStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Lỗi tải stats:', err);
    }
  };

  const fetchAwaitingPayments = async () => {
    try {
      const data = await bookingApi.getBookings({ status: 'AWAITING_PAYMENT' });
      setAwaitingBookings(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const data = await bookingApi.getBookings({ status: 'COMPLETED' });
      setPaymentHistory(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingKyc = async () => {
    try {
      const data = await adminApi.getPendingKyc();
      setPendingKycList(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWithdraws = async () => {
    try {
      const data = await adminApi.getWithdraws({ status: 'PENDING' });
      setWithdraws(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers({ search: userSearch, role: userRoleFilter });
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAwaitingPayments();
    fetchPaymentHistory();
    fetchPendingKyc();
    fetchWithdraws();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch, userRoleFilter]);

  const handleConfirmPayment = async (bookingId) => {
    if (!window.confirm('Xác nhận đã nhận đủ tiền thanh toán cho đơn này?')) return;
    setIsProcessingPayment(bookingId);
    try {
      await adminApi.confirmPayment(bookingId);
      alert('Đã xác nhận thanh toán thành công! Tiền công đã được cộng vào ví của Người giúp việc.');
      fetchAwaitingPayments();
      fetchPaymentHistory();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi xác nhận thanh toán');
    } finally {
      setIsProcessingPayment(null);
    }
  };

  const handleRejectPayment = async (bookingId) => {
    const reason = window.prompt('Nhập lý do từ chối xác nhận thanh toán:', 'Chưa nhận được tiền vào tài khoản');
    if (!reason) return;
    setIsProcessingPayment(bookingId);
    try {
      await adminApi.rejectPayment(bookingId, reason);
      alert('Đã từ chối thanh toán và thông báo cho khách hàng.');
      fetchAwaitingPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi từ chối thanh toán');
    } finally {
      setIsProcessingPayment(null);
    }
  };

  const handleToggleLockUser = async (user) => {
    const isLocking = user.status !== 'LOCKED';
    let reason = '';
    if (isLocking) {
      reason = window.prompt('Nhập lý do khóa tài khoản:', 'Vi phạm chính sách nền tảng');
      if (reason === null) return;
    } else {
      if (!window.confirm(`Xác nhận mở khóa tài khoản cho ${user.name}?`)) return;
    }

    try {
      await adminApi.toggleLockUser(user._id, reason);
      alert(isLocking ? `Đã khóa tài khoản ${user.name}` : `Đã mở khóa tài khoản ${user.name}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái tài khoản');
    }
  };

  const pendingPaymentTotal = awaitingBookings.length + withdraws.length;

  const adminNav = [
    { 
      key: 'PAYMENT', 
      label: 'Duyệt thanh toán & Rút tiền', 
      icon: CreditCard, 
      badge: pendingPaymentTotal > 0 ? `${pendingPaymentTotal}` : null,
      active: activeTab === 'PAYMENT',
      onClick: () => setActiveTab('PAYMENT'),
    },
    { 
      key: 'KYC', 
      label: 'Duyệt KYC Cấp 2', 
      icon: ShieldCheck, 
      badge: pendingKycList.length > 0 ? `${pendingKycList.length}` : null,
      active: activeTab === 'KYC',
      onClick: () => setActiveTab('KYC'),
    },
    { 
      key: 'DISPUTES', 
      label: 'Khiếu nại & Tranh chấp', 
      icon: AlertOctagon,
      active: activeTab === 'DISPUTES',
      onClick: () => setActiveTab('DISPUTES'),
    },
    { 
      key: 'USERS', 
      label: 'Người dùng & Thống kê', 
      icon: Users,
      active: activeTab === 'USERS',
      onClick: () => setActiveTab('USERS'),
    },
    { 
      key: 'PRICING', 
      label: 'Bảng giá & Hệ thống', 
      icon: Settings,
      active: activeTab === 'PRICING',
      onClick: () => setActiveTab('PRICING'),
    },
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'PAYMENT': return 'Duyệt thanh toán & Rút tiền';
      case 'KYC': return 'Kiểm duyệt hồ sơ KYC Cấp 2';
      case 'DISPUTES': return 'Xử lý Khiếu nại & Tranh chấp';
      case 'USERS': return 'Quản lý Người dùng & Thống kê';
      case 'PRICING': return 'Cấu hình Bảng giá & Hệ thống';
      default: return 'Bảng điều khiển Quản trị';
    }
  };

  return (
    <DashboardLayout 
      roleBadge="Quản trị viên"
      roleColor="blue"
      sidebarNav={adminNav}
      activeTab={activeTab}
      onTabChange={(tabKey) => setActiveTab(tabKey)}
      pageTitle={getPageTitle()}
      pageSubtitle="Hệ thống điều hành và giám sát GiúpViệc24"
    >
      <div className="space-y-6">

        {/* Dynamic Tab Content */}
        {activeTab === 'PAYMENT' && (
          <PaymentsAndWithdrawsTab
            awaitingBookings={awaitingBookings}
            paymentHistory={paymentHistory}
            paymentSubTab={paymentSubTab}
            setPaymentSubTab={setPaymentSubTab}
            paymentSearch={paymentSearch}
            setPaymentSearch={setPaymentSearch}
            isProcessingPayment={isProcessingPayment}
            handleConfirmPayment={handleConfirmPayment}
            handleRejectPayment={handleRejectPayment}
            fetchAwaitingPayments={fetchAwaitingPayments}
            fetchPaymentHistory={fetchPaymentHistory}
            withdraws={withdraws}
            fetchWithdraws={fetchWithdraws}
          />
        )}

        {activeTab === 'KYC' && (
          <KycAndWorkersTab
            pendingKycList={pendingKycList}
            fetchPendingKyc={fetchPendingKyc}
          />
        )}

        {activeTab === 'DISPUTES' && (
          <DisputesTab />
        )}

        {activeTab === 'USERS' && (
          <OverviewAndUsersTab
            stats={stats}
            users={users}
            fetchStats={fetchStats}
            fetchUsers={fetchUsers}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            userRoleFilter={userRoleFilter}
            setUserRoleFilter={setUserRoleFilter}
            handleToggleLockUser={handleToggleLockUser}
          />
        )}

        {activeTab === 'PRICING' && (
          <PricingAndContentTab />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
