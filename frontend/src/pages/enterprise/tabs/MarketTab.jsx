import React, { useState } from 'react';
import { CalendarCheck, MapPin, UserCheck, X } from 'lucide-react';
import { formatVND } from '../../../utils/serviceUtils';
import bookingApi from '../../../api/bookingApi';

const MarketTab = ({
  openBookings = [],
  employees = [],
  isLoading = false,
  onRefresh,
  onBookingClaimed,
  onNavigateToEmployees,
}) => {
  const [claimModalBooking, setClaimModalBooking] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const openClaimModal = (booking) => {
    if (!employees || employees.length === 0) {
      alert('Doanh nghiệp chưa có nhân viên nào trong danh sách! Vui lòng thêm nhân viên trước.');
      if (onNavigateToEmployees) onNavigateToEmployees();
      return;
    }
    setClaimModalBooking(booking);
    setSelectedEmployeeId(employees[0]?.id || '');
  };

  const handleConfirmClaim = async (e) => {
    e.preventDefault();
    if (!claimModalBooking || !selectedEmployeeId) return;

    const bId = claimModalBooking.id || claimModalBooking._id;
    setActionLoadingId(bId);
    try {
      const res = await bookingApi.acceptBooking(bId, {
        employeeId: selectedEmployeeId,
      });
      alert(res.message || 'Đã nhận ca và phân công nhân sự thành công!');
      setClaimModalBooking(null);
      if (onBookingClaimed) onBookingClaimed();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể nhận ca lúc này');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Chợ việc làm chờ phân công điều phối</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Doanh nghiệp nhận ca từ sàn, chọn 1 nhân viên phụ trách. Chiết khấu sàn B2B: 12% (thực nhận 88%).
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full font-bold transition-all disabled:opacity-50"
        >
          {isLoading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {openBookings.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Hiện không có ca việc nào đang chờ nhận trên Chợ việc làm.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {openBookings.map((b) => {
            const labor = b.pricingSnapshot?.laborTotal || b.totalPrice || 0;
            const advance = b.pricingSnapshot?.advanceFee || 0;
            const b2bEarning = Math.round(labor * 0.88) + advance;

            return (
              <div
                key={b._id || b.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-amber-400 flex flex-col justify-between bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {b.service}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{b.price}</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1.5 my-3">
                    <div className="flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Thời gian: <strong>{b.date} lúc {b.time}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="line-clamp-1">Khu vực: {b.address}</span>
                    </div>
                    {b.notes && (
                      <div className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                        "{b.notes}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Thực nhận Doanh nghiệp (88%)
                    </div>
                    <div className="text-sm font-black text-emerald-600">{formatVND(b2bEarning)}</div>
                  </div>
                  <button
                    disabled={actionLoadingId === (b._id || b.id)}
                    onClick={() => openClaimModal(b)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 transition-all"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Nhận ca & Gán nhân sự</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Chọn Nhân Sự */}
      {claimModalBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Phân công nhân sự nhận ca</h3>
              <button
                onClick={() => setClaimModalBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmClaim} className="space-y-4 mt-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <div>Dịch vụ: <strong>{claimModalBooking.service}</strong></div>
                <div>Thời gian: <strong>{claimModalBooking.date} lúc {claimModalBooking.time}</strong></div>
                <div>Khu vực: <strong>{claimModalBooking.address}</strong></div>
                <div className="text-emerald-600 font-bold pt-1">
                  Doanh nghiệp thực nhận: ~
                  {formatVND(
                    Math.round(
                      (claimModalBooking.pricingSnapshot?.laborTotal || claimModalBooking.totalPrice || 0) * 0.88
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn nhân viên phụ trách ca này <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.phone}) - {emp.gender || 'Nữ'}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Hệ thống tự động kiểm tra đệm 30 phút để tránh trùng lịch làm việc.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimModalBooking(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId !== null}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {actionLoadingId ? 'Đang nhận...' : 'Xác nhận nhận ca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketTab;

