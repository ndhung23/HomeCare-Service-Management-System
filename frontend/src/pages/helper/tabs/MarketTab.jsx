import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Sparkles, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import bookingApi from '../../../api/bookingApi';
import { formatVND } from '../../../utils/serviceUtils';

const MarketTab = ({ user, onJobAccepted, onNavigateToKyc }) => {
  const [openBookings, setOpenBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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
  }, []);

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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
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
        <button
          onClick={fetchMarket}
          disabled={isLoading}
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
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
            return (
              <div
                key={job._id || job.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
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
