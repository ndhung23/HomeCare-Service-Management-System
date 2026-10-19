import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Users, 
  ShieldCheck,
  CreditCard,
  DollarSign,
  Search,
  RefreshCw
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
  const [isProcessingPayment, setIsProcessingPayment] = useState(null);

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
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi xác nhận thanh toán');
    } finally {
      setIsProcessingPayment(null);
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
    { label: 'Xác nhận thanh toán', path: '#', onClick: () => setActiveTab('PAYMENT'), icon: DollarSign, badge: `${awaitingBookings.length}` },
    { label: 'Duyệt CCCD (KYC)', path: '#', onClick: () => setActiveTab('KYC'), icon: ShieldCheck, badge: `${pendingKycList.length}` },
    { label: 'Duyệt lệnh rút tiền', path: '#', onClick: () => setActiveTab('WITHDRAW'), icon: CreditCard, badge: `${withdraws.length}` },
    { label: 'Quản lý người dùng', path: '#', onClick: () => setActiveTab('USERS'), icon: Users },
  ];

  return (
    <DashboardLayout
      roleBadge="Admin (/admin)"
      roleColor="indigo"
      sidebarNav={adminNav}
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
          <span>Xác nhận thanh toán đơn</span>
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

      {/* Tab 1: Payment Confirmation */}
      {activeTab === 'PAYMENT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Danh sách đơn chờ xác nhận tiền chuyển khoản</h3>
              <p className="text-xs text-slate-400 mt-0.5">Sau khi kiểm tra tài khoản nhận được tiền quét VietQR, bấm xác nhận để tự động cộng tiền vào ví người giúp việc</p>
            </div>
            <button onClick={fetchAwaitingPayments} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {awaitingBookings.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">Không có đơn nào đang chờ xác nhận thanh toán</div>
          ) : (
            <div className="space-y-3">
              {awaitingBookings.map((b) => (
                <div key={b._id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-blue-600 text-xs">{b.bookingCode}</span>
                      <span className="font-bold text-slate-900 text-sm">{b.service}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Khách hàng: <strong>{b.customerName}</strong> ({b.customerPhone}) • Người làm: <strong>{b.helper}</strong>
                    </div>
                    <div className="text-xs text-slate-400">
                      Thời gian: {b.date} • {b.time} ({b.durationHours}h) • Địa chỉ: {b.address}
                    </div>
                    {b.evidence && b.evidence.length > 0 && (
                      <div className="pt-1 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500">Ảnh nghiệm thu:</span>
                        {b.evidence.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="w-6 h-6 rounded border overflow-hidden">
                            <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex md:flex-col items-center md:items-end justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400">Tổng tiền khách trả:</div>
                      <div className="text-base font-black text-blue-700">{b.price || formatVND(b.totalPrice)}</div>
                      <div className="text-[11px] text-emerald-600 font-bold">
                        Giải ngân ví: {formatVND(b.pricingSnapshot?.helperEarnings || Math.round(b.totalPrice * 0.8))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleConfirmPayment(b._id)}
                      disabled={isProcessingPayment === b._id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      {isProcessingPayment === b._id ? 'Đang giải ngân...' : 'Xác nhận đã nhận tiền'}
                    </button>
                  </div>
                </div>
              ))}
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
    </DashboardLayout>
  );
};

export default AdminDashboard;
