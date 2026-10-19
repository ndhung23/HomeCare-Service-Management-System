import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Lock, 
  Unlock, 
  AlertTriangle,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatVND } from '../../../utils/serviceUtils';
import adminApi from '../../../api/adminApi';

const OverviewAndUsersTab = ({
  stats,
  users = [],
  fetchStats,
  fetchUsers,
  userSearch,
  setUserSearch,
  userRoleFilter,
  setUserRoleFilter,
  handleToggleLockUser,
}) => {
  const USERS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserViolations, setSelectedUserViolations] = useState(null);
  const [removingViolationId, setRemovingViolationId] = useState(null);

  // Reset về trang 1 khi lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [userSearch, userRoleFilter]);

  const totalPages = Math.max(1, Math.ceil((users?.length || 0) / USERS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = (users || []).slice(startIndex, startIndex + USERS_PER_PAGE);

  const handleRemoveViolation = async (userId, violationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ bỏ bản ghi vi phạm này cho người dùng không?')) return;
    setRemovingViolationId(violationId);
    try {
      await adminApi.removeViolation(userId, violationId, 'Admin đã kiểm tra và gỡ bỏ vi phạm');
      alert('Đã gỡ bỏ vi phạm thành công!');
      fetchUsers();
      if (selectedUserViolations) {
        setSelectedUserViolations((prev) => ({
          ...prev,
          violations: prev.violations.map((v) =>
            v._id === violationId ? { ...v, removedByAdmin: true } : v
          ),
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi gỡ vi phạm');
    } finally {
      setRemovingViolationId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Cards Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu sàn</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {formatVND(stats?.revenue?.platformRevenue || 0)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Tổng GMV: <span className="font-semibold text-gray-800">{formatVND(stats?.revenue?.grossVolume || 0)}</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng đơn dịch vụ</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.bookings?.total || 0}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Đã hoàn thành: <span className="font-semibold text-emerald-600">{stats?.bookings?.completed || 0}</span> ca
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {(stats?.users?.customers || 0) + (stats?.users?.helpers || 0) + (stats?.users?.enterprises || 0)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {stats?.users?.customers || 0} Khách • {stats?.users?.helpers || 0} Thợ • {stats?.users?.enterprises || 0} DN
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Chờ duyệt</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {stats?.users?.pendingKyc || 0}
              </h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-amber-700 mt-3 font-medium">
            Hồ sơ CCCD đang đợi xác thực Cấp 2
          </p>
        </div>
      </div>

      {/* Quản lý danh sách người dùng */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Danh sách tài khoản & Quản lý vi phạm</h3>
            <p className="text-sm text-gray-500">Xem thông tin, vi phạm và khóa/mở khóa tài khoản người dùng</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { fetchStats(); fetchUsers(); }}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
              title="Làm mới"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên, email, SĐT..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
              />
            </div>
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="customer">Khách hàng</option>
              <option value="helper">Người giúp việc</option>
              <option value="enterprise">Doanh nghiệp</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-y border-gray-200">
              <tr>
                <th className="py-3 px-4">Người dùng</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">KYC / Trạng thái</th>
                <th className="py-3 px-4">Ví khả dụng</th>
                <th className="py-3 px-4">Vi phạm</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const activeViolations = (u.violations || []).filter((v) => !v.removedByAdmin);
                  const isLocked = u.status === 'LOCKED';

                  return (
                    <tr key={u._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email} • {u.phone || 'Chưa có SĐT'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {u.role === 'customer' ? 'Khách hàng' : u.role === 'helper' ? 'Người giúp việc' : u.role === 'enterprise' ? 'Doanh nghiệp' : 'Admin'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold w-fit ${
                            u.kycLevel === 2 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            Cấp {u.kycLevel || 1}
                          </span>
                          {isLocked ? (
                            <span className="text-xs text-rose-600 font-medium">Đã khóa</span>
                          ) : (
                            <span className="text-xs text-emerald-600 font-medium">Hoạt động</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {formatVND(u.wallet?.available || 0)}
                      </td>
                      <td className="py-3 px-4">
                        {activeViolations.length > 0 ? (
                          <button
                            onClick={() => setSelectedUserViolations(u)}
                            className="px-2 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-100 flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {activeViolations.length} vi phạm
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Không có</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleLockUser(u)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
                              isLocked
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            }`}
                          >
                            {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            {isLocked ? 'Mở khóa' : 'Khóa'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Thanh phân trang 3 người / trang */}
        {users.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              Hiển thị <span className="font-semibold text-gray-800">{startIndex + 1}</span> - <span className="font-semibold text-gray-800">{Math.min(startIndex + USERS_PER_PAGE, users.length)}</span> trên tổng số <span className="font-semibold text-gray-800">{users.length}</span> người dùng
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      currentPage === page
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Chi tiết & Xóa vi phạm oan */}
      {selectedUserViolations && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Lịch sử vi phạm của {selectedUserViolations.name}</h3>
                <p className="text-xs text-gray-500">Xem và gỡ bỏ các bản ghi vi phạm oan</p>
              </div>
              <button onClick={() => setSelectedUserViolations(null)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(selectedUserViolations.violations || []).length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">Người dùng chưa có ghi nhận vi phạm nào.</p>
              ) : (
                selectedUserViolations.violations.map((v) => (
                  <div
                    key={v._id}
                    className={`p-3 rounded-xl border text-sm flex items-start justify-between gap-3 ${
                      v.removedByAdmin ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-rose-50/60 border-rose-200'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{v.reason}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Ngày ghi: {new Date(v.createdAt).toLocaleString('vi-VN')}
                      </p>
                      {v.removedByAdmin && (
                        <p className="text-xs text-emerald-600 font-semibold mt-1">
                          ✓ Đã được Admin gỡ vi phạm ({v.adminNote || 'Không có ghi chú'})
                        </p>
                      )}
                    </div>
                    {!v.removedByAdmin && (
                      <button
                        onClick={() => handleRemoveViolation(selectedUserViolations._id, v._id)}
                        disabled={removingViolationId === v._id}
                        className="px-2.5 py-1 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Gỡ vi phạm
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedUserViolations(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewAndUsersTab;

