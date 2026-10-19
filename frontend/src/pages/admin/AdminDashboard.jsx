import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Users, 
  ShieldCheck,
  CreditCard,
  DollarSign,
  Search,
  RefreshCw,
  QrCode,
  X,
  Play,
  CheckCircle2
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import bookingApi from '../../api/bookingApi';
import { formatVND } from '../../utils/serviceUtils';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('PAYMENT'); // 'PAYMENT' | 'KYC' | 'WITHDRAW' | 'USERS' | 'OVERVIEW'
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Tab 1: Payments state
  const [awaitingBookings, setAwaitingBookings] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentSubTab, setPaymentSubTab] = useState('AWAITING'); // 'AWAITING' | 'HISTORY'
  const [paymentSearch, setPaymentSearch] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(null);
  const [activeEvidenceModal, setActiveEvidenceModal] = useState(null);

  // Tab 2: KYC state
  const [pendingKycList, setPendingKycList] = useState([]);

  // Tab 3: Withdraw state
  const [withdraws, setWithdraws] = useState([]);

  // Tab 4: Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Lỗi tải stats:', err);
    } finally {
      setIsLoadingStats(false);
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
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handleConfirmPayment = async (bookingId) => {
    if (!window.confirm('Xác nhận bạn đã nhận được tiền chuyển khoản VietQR cho ca làm việc này?')) return;
    setIsProcessingPayment(bookingId);
    try {
      const res = await adminApi.confirmPayment(bookingId);
      alert(res.message || 'Xác nhận thanh toán và giải ngân thành công!');
      fetchAwaitingPayments();
      fetchPaymentHistory();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi xác nhận thanh toán');
    } finally {
      setIsProcessingPayment(null);
    }
  };

  const handleRejectPayment = async (bookingId, bookingCode) => {
    const reason = window.prompt(`Nhập lý do chưa xác nhận/yêu cầu kiểm tra lại thanh toán ca ${bookingCode}:`, 'Chưa nhận được tiền chuyển khoản hoặc sai cú pháp chuyển khoản');
    if (!reason) return;
    try {
      await adminApi.rejectPayment(bookingId, reason);
      alert('Đã gửi thông báo yêu cầu đối soát lại cho khách hàng!');
      fetchAwaitingPayments();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi thao tác');
    }
  };

  const handleApproveKyc = async (userId) => {
    if (!window.confirm('Phê duyệt hồ sơ CCCD của người dùng này lên Cấp 2?')) return;
    try {
      const res = await adminApi.approveKyc(userId);
      alert(res.message || 'Phê duyệt Cấp 2 thành công!');
      fetchPendingKyc();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi duyệt KYC');
    }
  };

  const handleRejectKyc = async (userId) => {
    const reason = window.prompt('Nhập lý do từ chối hồ sơ KYC:') || 'Ảnh CCCD mờ hoặc thông tin không trùng khớp';
    try {
      await adminApi.rejectKyc(userId, reason);
      alert('Đã từ chối hồ sơ KYC.');
      fetchPendingKyc();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi từ chối');
    }
  };

  const handleApproveWithdraw = async (withdrawId) => {
    if (!window.confirm('Xác nhận đã chuyển khoản cho lệnh rút này?')) return;
    try {
      await adminApi.approveWithdraw(withdrawId);
      alert('Đã phê duyệt lệnh rút tiền thành công!');
      fetchWithdraws();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi duyệt lệnh rút');
    }
  };

  const handleRejectWithdraw = async (withdrawId) => {
    const reason = window.prompt('Nhập lý do từ chối lệnh rút tiền:') || 'Thông tin ngân hàng không hợp lệ';
    try {
      await adminApi.rejectWithdraw(withdrawId, reason);
      alert('Đã từ chối và hoàn tiền về ví cho người dùng!');
      fetchWithdraws();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi');
    }
  };

  const handleToggleLockUser = async (userObj) => {
    const isLocking = userObj.status !== 'LOCKED';
    const reason = isLocking ? window.prompt(`Nhập lý do khóa tài khoản ${userObj.name}:`) : '';
    if (isLocking && reason === null) return;

    try {
      const res = await adminApi.toggleLockUser(userObj._id, reason);
      alert(res.message || 'Thao tác thành công!');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi');
    }
  };

  const adminNav = [
    { key: 'PAYMENT', label: 'Duyệt thanh toán', active: activeTab === 'PAYMENT', onClick: () => setActiveTab('PAYMENT'), icon: DollarSign, badge: awaitingBookings.length > 0 ? `${awaitingBookings.length}` : null },
    { key: 'KYC', label: 'Duyệt CCCD (KYC)', active: activeTab === 'KYC', onClick: () => setActiveTab('KYC'), icon: ShieldCheck, badge: pendingKycList.length > 0 ? `${pendingKycList.length}` : null },
    { key: 'WITHDRAW', label: 'Duyệt lệnh rút tiền', active: activeTab === 'WITHDRAW', onClick: () => setActiveTab('WITHDRAW'), icon: CreditCard, badge: withdraws.length > 0 ? `${withdraws.length}` : null },
    { key: 'USERS', label: 'Quản lý người dùng', active: activeTab === 'USERS', onClick: () => setActiveTab('USERS'), icon: Users, badge: users.length > 0 ? `${users.length}` : null },
  ];

  return (
    <DashboardLayout
      roleBadge="Quản trị viên"
      roleColor="indigo"
      sidebarNav={adminNav}
      activeTab={activeTab}
      onTabChange={(tabKey) => setActiveTab(tabKey)}
      pageTitle="Bảng điều khiển Quản trị viên"
      pageSubtitle="Giám sát vận hành, đối soát thanh toán và phê duyệt danh tính"
    >
      {/* Quick Stats Grid */}
      <div className="flex justify-end mb-3">
        <button
          onClick={fetchStats}
          disabled={isLoadingStats}
          className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
          <span>Làm mới số liệu</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Doanh thu phí sàn</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {formatVND(stats?.revenue?.platformRevenue || 0)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Tổng giá trị giao dịch: {formatVND(stats?.revenue?.grossVolume || 0)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Chờ xác nhận tiền</span>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{awaitingBookings.length}</div>
          <div className="text-xs text-amber-600 font-semibold mt-2">
            Đơn hoàn thành đang chờ quét QR
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Hồ sơ KYC chờ duyệt</span>
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{pendingKycList.length}</div>
          <div className="text-xs text-blue-600 font-semibold mt-2">
            Cần đối chiếu ảnh 2 mặt CCCD
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Lệnh rút tiền chờ duyệt</span>
            <CreditCard className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{withdraws.length}</div>
          <div className="text-xs text-indigo-600 font-semibold mt-2">
            Cộng tác viên yêu cầu rút về bank
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-3">
        <button
          onClick={() => setActiveTab('PAYMENT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PAYMENT' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Duyệt thanh toán</span>
          {awaitingBookings.length > 0 && (
            <span className="bg-white text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {awaitingBookings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('KYC')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'KYC' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Duyệt hồ sơ CCCD (KYC)</span>
          {pendingKycList.length > 0 && (
            <span className="bg-white text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {pendingKycList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('WITHDRAW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'WITHDRAW' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Duyệt lệnh rút tiền</span>
          {withdraws.length > 0 && (
            <span className="bg-white text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {withdraws.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'USERS' ? 'bg-slate-800 text-white shadow-xs' : 'bg-white border text-slate-700 hover:bg-slate-50'
          }`}
        >
          Quản lý người dùng ({users.length})
        </button>
      </div>

      {/* Tab 1: Payment Approval & Auditing */}
      {activeTab === 'PAYMENT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Quản lý duyệt thanh toán & Đối soát</h3>
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  VietQR Chuyển khoản
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Đối soát tiền khách đã chuyển khoản qua VietQR, phê duyệt để giải ngân ví người làm hoặc yêu cầu kiểm tra lại
              </p>
            </div>
            <button
              onClick={() => { fetchAwaitingPayments(); fetchPaymentHistory(); fetchStats(); }}
              className="p-2 border rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
          </div>

          {/* Integration Notice Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-900">
                  Cơ chế thanh toán hiện tại: VietQR Chuyển khoản ngân hàng (MB Bank)
                </div>
                <div className="text-[11px] text-blue-700 mt-0.5">
                  Khách quét QR theo mã đơn &rarr; Tiền về tài khoản nền tảng &rarr; Admin đối soát và bấm Duyệt &rarr; Ví cộng tự động 80% (CTV) hoặc 88% (Doanh nghiệp).
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white text-indigo-700 border border-indigo-200 shadow-xs">
                <span>⚡ Cổng tự động (VNPay / MoMo): Sắp ra mắt</span>
              </span>
            </div>
          </div>

          {/* Sub-tabs & Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
              <button
                onClick={() => setPaymentSubTab('AWAITING')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  paymentSubTab === 'AWAITING' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Chờ duyệt thanh toán</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700">
                  {awaitingBookings.length}
                </span>
              </button>
              <button
                onClick={() => setPaymentSubTab('HISTORY')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  paymentSubTab === 'HISTORY' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Lịch sử đã duyệt</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700">
                  {paymentHistory.length}
                </span>
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                placeholder="Tìm mã đơn, khách hàng, người làm..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Sub-tab 1: Awaiting Payment Approval */}
          {paymentSubTab === 'AWAITING' && (
            <div>
              {awaitingBookings.filter((b) => {
                if (!paymentSearch) return true;
                const term = paymentSearch.toLowerCase();
                return (
                  (b.bookingCode && b.bookingCode.toLowerCase().includes(term)) ||
                  (b.customerName && b.customerName.toLowerCase().includes(term)) ||
                  (b.customerPhone && b.customerPhone.includes(term)) ||
                  (b.helper && b.helper.toLowerCase().includes(term)) ||
                  (b.service && b.service.toLowerCase().includes(term))
                );
              }).length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl text-xs text-slate-400">
                  Không có đơn nào đang chờ duyệt thanh toán
                </div>
              ) : (
                <div className="space-y-4">
                  {awaitingBookings
                    .filter((b) => {
                      if (!paymentSearch) return true;
                      const term = paymentSearch.toLowerCase();
                      return (
                        (b.bookingCode && b.bookingCode.toLowerCase().includes(term)) ||
                        (b.customerName && b.customerName.toLowerCase().includes(term)) ||
                        (b.customerPhone && b.customerPhone.includes(term)) ||
                        (b.helper && b.helper.toLowerCase().includes(term)) ||
                        (b.service && b.service.toLowerCase().includes(term))
                      );
                    })
                    .map((b) => {
                      const evidenceList = b.evidence || b.evidencePhotos || [];
                      const helperEarnings = b.pricingSnapshot?.helperEarnings || Math.round((b.totalPrice || 0) * 0.8);
                      const platformFee = b.pricingSnapshot?.platformFee || Math.round((b.totalPrice || 0) * 0.2);
                      const feePercent = Math.round((b.pricingSnapshot?.feeRate || (b.assigneeType === 'ENTERPRISE' ? 0.12 : 0.20)) * 100);

                      return (
                        <div key={b._id} className="p-5 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all bg-white shadow-xs space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">#{b.bookingCode}</span>
                                <span className="font-black text-slate-900 text-sm">{b.service}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  Chờ duyệt tiền VietQR
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                Thời gian ca: <strong>{b.date} • {b.time}</strong> ({b.durationHours || 2}h) • Địa chỉ: <strong>{b.address}</strong>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-slate-400">Khách cần thanh toán:</div>
                              <div className="text-lg font-black text-blue-700">{b.price || formatVND(b.totalPrice)}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-slate-400 block text-[11px]">Khách hàng thanh toán:</span>
                              <span className="font-bold text-slate-900">{b.customerName || 'Khách vãng lai'}</span>
                              <div className="text-slate-500 text-[11px]">{b.customerPhone || 'Chưa có SĐT'}</div>
                            </div>

                            <div>
                              <span className="text-slate-400 block text-[11px]">Người nhận việc (Hưởng thu nhập):</span>
                              <span className="font-bold text-slate-900">{b.helper}</span>
                              <div className="text-slate-500 text-[11px]">{b.helperPhone || 'SĐT người làm'} • {b.assigneeType === 'ENTERPRISE' ? 'Doanh nghiệp (Phí 12%)' : 'CTV Cá nhân (Phí 20%)'}</div>
                            </div>

                            <div>
                              <span className="text-slate-400 block text-[11px]">Quyết toán ví khi duyệt:</span>
                              <div className="font-bold text-emerald-600 text-sm">+{formatVND(helperEarnings)}</div>
                              <div className="text-[11px] text-slate-500">Phí sàn giữ lại: {formatVND(platformFee)} ({feePercent}%)</div>
                            </div>
                          </div>

                          {/* Evidence photos/videos from Cloudinary */}
                          {evidenceList.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                                <span>Bằng chứng hoàn thành ca ({evidenceList.length} tệp trên Cloudinary):</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {evidenceList.map((url, i) => {
                                  const isVideo = /\.(mp4|mov|webm)(\?.*)?$/i.test(url) || url.includes('/video/upload/');
                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => setActiveEvidenceModal({ title: `Bằng chứng đơn ${b.bookingCode}`, items: evidenceList })}
                                      className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden group hover:border-blue-500"
                                    >
                                      {isVideo ? (
                                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                                          <Play className="w-5 h-5 fill-white" />
                                        </div>
                                      ) : (
                                        <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                      )}
                                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5">
                                        {isVideo ? 'Video' : `Ảnh ${i + 1}`}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                            <div className="text-[11px] text-slate-500">
                              Nội dung đối soát VietQR: <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{b.bookingCode}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleRejectPayment(b._id, b.bookingCode)}
                                className="px-3.5 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all"
                              >
                                Báo chưa nhận tiền / Đối soát lại
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmPayment(b._id)}
                                disabled={isProcessingPayment === b._id}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{isProcessingPayment === b._id ? 'Đang giải ngân...' : 'Duyệt thanh toán & Giải ngân ví'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 2: History of Approved Payments */}
          {paymentSubTab === 'HISTORY' && (
            <div>
              {paymentHistory.filter((b) => {
                if (!paymentSearch) return true;
                const term = paymentSearch.toLowerCase();
                return (
                  (b.bookingCode && b.bookingCode.toLowerCase().includes(term)) ||
                  (b.customerName && b.customerName.toLowerCase().includes(term)) ||
                  (b.customerPhone && b.customerPhone.includes(term)) ||
                  (b.helper && b.helper.toLowerCase().includes(term)) ||
                  (b.service && b.service.toLowerCase().includes(term))
                );
              }).length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl text-xs text-slate-400">
                  Chưa có lịch sử thanh toán nào phù hợp
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory
                    .filter((b) => {
                      if (!paymentSearch) return true;
                      const term = paymentSearch.toLowerCase();
                      return (
                        (b.bookingCode && b.bookingCode.toLowerCase().includes(term)) ||
                        (b.customerName && b.customerName.toLowerCase().includes(term)) ||
                        (b.customerPhone && b.customerPhone.includes(term)) ||
                        (b.helper && b.helper.toLowerCase().includes(term)) ||
                        (b.service && b.service.toLowerCase().includes(term))
                      );
                    })
                    .map((b) => {
                      const helperEarnings = b.pricingSnapshot?.helperEarnings || Math.round((b.totalPrice || 0) * 0.8);
                      const platformFee = b.pricingSnapshot?.platformFee || Math.round((b.totalPrice || 0) * 0.2);

                      return (
                        <div key={b._id} className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">#{b.bookingCode}</span>
                              <span className="font-bold text-slate-900 text-sm">{b.service}</span>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Đã duyệt thanh toán
                              </span>
                            </div>
                            <div className="text-xs text-slate-600">
                              Khách hàng: <strong>{b.customerName}</strong> • Người nhận việc: <strong>{b.helper}</strong>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Đã giải ngân: <strong>{formatVND(helperEarnings)}</strong> • Phí sàn thu: <strong>{formatVND(platformFee)}</strong>
                              {b.paidAt && <span> • Ngày duyệt: {new Date(b.paidAt).toLocaleDateString('vi-VN')}</span>}
                            </div>
                          </div>

                          <div className="text-right flex items-center md:flex-col items-end justify-between">
                            <div className="text-xs font-bold text-slate-400">Tổng tiền đã thu:</div>
                            <div className="text-base font-black text-slate-900">{b.price || formatVND(b.totalPrice)}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: KYC Approvals */}
      {activeTab === 'KYC' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Danh sách hồ sơ CCCD chờ phê duyệt Cấp 2</h3>
            <p className="text-xs text-slate-400 mt-0.5">Đối chiếu ảnh chân dung và 2 mặt CCCD trước khi mở khóa quyền nhận việc</p>
          </div>

          {pendingKycList.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">Không có hồ sơ KYC nào đang chờ duyệt</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingKycList.map((u) => (
                <div key={u._id} className="p-4 border rounded-2xl space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-slate-900 text-sm">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email} • {u.phone}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Chờ duyệt Cấp 2
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border space-y-1">
                    <div>Họ tên trên CCCD: <strong>{u.kyc?.fullName || u.name}</strong></div>
                    <div>Số CCCD: <strong>{u.kyc?.idNumber}</strong></div>
                    <div>Năm sinh: {u.kyc?.dob || 'N/A'} • Giới tính: {u.kyc?.gender || 'Nữ'}</div>
                  </div>

                  {/* 3 Photos */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-500 mb-1">Chân dung</div>
                      <a href={u.kyc?.avatarUrl || u.avatar} target="_blank" rel="noreferrer" className="block w-full h-20 rounded-lg overflow-hidden border">
                        <img src={u.kyc?.avatarUrl || u.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      </a>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-500 mb-1">Mặt trước</div>
                      <a href={u.kyc?.idFrontUrl} target="_blank" rel="noreferrer" className="block w-full h-20 rounded-lg overflow-hidden border">
                        <img src={u.kyc?.idFrontUrl} alt="Front ID" className="w-full h-full object-cover" />
                      </a>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-500 mb-1">Mặt sau</div>
                      <a href={u.kyc?.idBackUrl} target="_blank" rel="noreferrer" className="block w-full h-20 rounded-lg overflow-hidden border">
                        <img src={u.kyc?.idBackUrl} alt="Back ID" className="w-full h-full object-cover" />
                      </a>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => handleRejectKyc(u._id)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-xl"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => handleApproveKyc(u._id)}
                      className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                    >
                      Phê duyệt Cấp 2
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Withdraw Requests */}
      {activeTab === 'WITHDRAW' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Danh sách yêu cầu rút tiền</h3>
            <p className="text-xs text-slate-400 mt-0.5">Xử lý chuyển khoản ngân hàng cho các cộng tác viên</p>
          </div>

          {withdraws.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">Không có lệnh rút tiền nào đang chờ xử lý</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {withdraws.map((w) => (
                <div key={w._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">
                      {w.userId?.name} ({w.userId?.email})
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Ngân hàng: <strong>{w.bank?.bankName}</strong> • Số TK: <strong>{w.bank?.accountNumber}</strong> • Chủ TK: {w.bank?.accountName}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tạo lúc: {new Date(w.createdAt).toLocaleString('vi-VN')}</div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div className="font-black text-blue-700 text-base">{formatVND(w.amount)}</div>
                    <button
                      onClick={() => handleRejectWithdraw(w._id)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => handleApproveWithdraw(w._id)}
                      className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                    >
                      Duyệt chuyển
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Users Management */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4">
            <h3 className="text-sm font-extrabold text-slate-900">Quản lý tài khoản hệ thống</h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  adminApi.getUsers({ search: userSearch, role: e.target.value }).then((data) => setUsers(data || []));
                }}
                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white outline-none focus:border-blue-600"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="customer">Khách hàng</option>
                <option value="helper">Người giúp việc</option>
                <option value="enterprise">Doanh nghiệp</option>
                <option value="admin">Quản trị viên</option>
              </select>
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, sđt..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  className="w-full pl-8 pr-3 py-1.5 border rounded-xl text-xs outline-none focus:border-blue-600"
                />
              </div>
              <button onClick={fetchUsers} className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold">
                Tìm
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                <tr>
                  <th className="py-3 px-4">Tên / Email</th>
                  <th className="py-3 px-4">Vai trò</th>
                  <th className="py-3 px-4">KYC Tier</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-400">{u.email} • {u.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.kycLevel === 2 ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Cấp 2 (Pro)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Cấp 1</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {u.status === 'LOCKED' ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                          Đang bị khóa
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700">Hoạt động</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleLockUser(u)}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] ${
                            u.status === 'LOCKED'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {u.status === 'LOCKED' ? 'Mở khóa' : 'Khóa nick'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cloud Evidence Photos & Videos Modal */}
      {activeEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-slate-900">{activeEvidenceModal.title}</h3>
              <button onClick={() => setActiveEvidenceModal(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {activeEvidenceModal.items.map((url, i) => {
                const isVideo = /\.(mp4|mov|webm)(\?.*)?$/i.test(url) || url.includes('/video/upload/');
                return isVideo ? (
                  <div key={i} className="rounded-xl overflow-hidden border bg-black">
                    <video controls src={url} className="w-full h-48 object-cover" />
                  </div>
                ) : (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="rounded-xl overflow-hidden border block bg-slate-50">
                    <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-48 object-cover hover:scale-105 transition-transform" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
