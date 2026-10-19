import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Sparkles, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import bookingApi from '../../../api/bookingApi';
import authApi from '../../../api/authApi';
import { formatVND } from '../../../utils/serviceUtils';

const MarketTab = ({ user, onJobAccepted, onNavigateToKyc }) => {
  const [openBookings, setOpenBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailableForJobs !== false);

  const fetchMarket = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await bookingApi.getMarketBookings();
      setOpenBookings(data || []);
    } catch (err) {
      console.error('Lỗi tải Chợ việc làm:', err);
      setErrorMsg('Không thể tải danh sách việc lúc này.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
    setIsAvailable(user?.isAvailableForJobs !== false);
  }, [user]);

  const handleToggleAvailability = async (e) => {
    const val = e.target.checked;
    setIsAvailable(val);
    try {
      await authApi.updateAvailability({ isAvailableForJobs: val });
    } catch (err) {
      console.error(err);
      setIsAvailable(!val);
    }
  };

  const isLevel2 = (user?.kycLevel || 1) >= 2;

  const handleAccept = async (bookingId) => {
    if (!isLevel2) {
      alert('Tài khoản Cấp 1 cần chờ Admin xác thực hồ sơ CCCD để bắt đầu nhận việc!');
      return;
    }

    setActionLoadingId(bookingId);
    try {
      await bookingApi.acceptBooking(bookingId);
      alert('Nhận việc thành công! Ca làm việc đã được chuyển vào Lịch của bạn.');
      await fetchMarket();
      if (onJobAccepted) onJobAccepted();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi nhận việc!';
      alert(msg);
      await fetchMarket();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRespondInvite = async (bookingId, action) => {
    setActionLoadingId(bookingId);
    try {
      await bookingApi.respondInvite(bookingId, { action });
      alert(action === 'accept' ? 'Đã nhận ca thành công!' : 'Đã từ chối lời mời.');
      await fetchMarket();
      if (action === 'accept' && onJobAccepted) onJobAccepted();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi phản hồi lời mời!');
      await fetchMarket();
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* KYC Alert if Level 1 */}
      {!isLevel2 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-900">
              <span className="font-bold">Bạn đang ở Tài khoản Cấp 1:</span> Nút nhận việc đang tạm khóa. Vui lòng nộp hồ sơ CCCD để mở khóa nhận việc từ Chợ.
            </div>
          </div>
          <button
            onClick={onNavigateToKyc}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shrink-0"
          >
            Nộp CCCD ngay
          </button>
        </div>
      )}

      {/* Header filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>Chợ việc làm mới</span>
            <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {openBookings.length} ca đang chờ
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Các ca khách hàng vừa đặt và đang chờ người giúp việc phù hợp nhận việc
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={handleToggleAvailability}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className={isAvailable ? 'text-emerald-700' : 'text-slate-400'}>
              {isAvailable ? '● Sẵn sàng nhận việc' : '○ Tạm nghỉ nhận ca'}
            </span>
          </label>
          <button
            onClick={fetchMarket}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-bold">
          {errorMsg}
        </div>
      )}

      {/* Jobs list */}
      {openBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm font-bold text-slate-600">Hiện tại chưa có ca việc mới nào</div>
          <p className="text-xs mt-1">Khi khách hàng đặt đơn, các ca việc trong khu vực sẽ xuất hiện tức thì tại đây.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {openBookings.map((job) => {
            const earnings = job.helperEarnings || Math.round((job.totalPrice || 0) * 0.8);
            const isInvited = Boolean(job.isInvitedToMe);

            return (
              <div
                key={job._id || job.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isInvited ? 'border-purple-400 ring-2 ring-purple-100' : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                <div>
                  {isInvited && (
                    <div className="mb-3 p-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Lời mời dành riêng cho bạn
                      </span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase">
                        {job.dispatchMode || 'Ưu tiên'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {job.bookingCode}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">{job.service}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-600">Thực nhận 80%:</div>
                      <div className="text-base font-black text-emerald-700">{formatVND(earnings)}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{job.date} • lúc <strong>{job.time}</strong> ({job.durationHours} tiếng)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{job.maskedAddress || 'Khu vực Hà Nội'}</span>
                    </div>
                    {job.notes && (
                      <div className="text-[11px] text-slate-500 italic mt-1 pt-1 border-t border-slate-200/60">
                        "{job.notes}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Tổng giá đơn: {job.price || formatVND(job.totalPrice)}
                  </div>
                  {isInvited ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespondInvite(job._id || job.id, 'reject')}
                        disabled={actionLoadingId === (job._id || job.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleRespondInvite(job._id || job.id, 'accept')}
                        disabled={!isLevel2 || actionLoadingId === (job._id || job.id)}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Nhận ca
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAccept(job._id || job.id)}
                      disabled={!isLevel2 || actionLoadingId === (job._id || job.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                        !isLevel2
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{actionLoadingId === (job._id || job.id) ? 'Đang nhận...' : 'Nhận việc ngay'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MarketTab;
