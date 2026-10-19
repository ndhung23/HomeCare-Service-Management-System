import React, { useState } from 'react';
import { PlayCircle, Upload, CheckCircle2, X } from 'lucide-react';
import { getBookingStatusInfo } from '../../../utils/bookingStatus';
import { formatVND } from '../../../utils/serviceUtils';
import bookingApi from '../../../api/bookingApi';

const ScheduleTab = ({ companyBookings = [], isLoading = false, onRefresh }) => {
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Evidence modal state
  const [completingBooking, setCompletingBooking] = useState(null);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidencePreviews, setEvidencePreviews] = useState([]);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  const handleStartBooking = async (bookingId) => {
    if (!window.confirm('Xác nhận nhân viên công ty đã có mặt và bắt đầu ca làm việc?')) return;
    setActionLoadingId(bookingId);
    try {
      await bookingApi.startBooking(bookingId);
      alert('Đã bắt đầu thực hiện ca làm việc!');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi bắt đầu ca');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openCompleteModal = (booking) => {
    setCompletingBooking(booking);
    setEvidenceFiles([]);
    setEvidencePreviews([]);
  };

  const handleEvidenceFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (evidenceFiles.length + files.length > 5) {
      alert('Tối đa 5 ảnh bằng chứng hoàn thành ca!');
      return;
    }
    setEvidenceFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setEvidencePreviews((prev) => [...prev, ...previews]);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (evidenceFiles.length === 0) {
      alert('Vui lòng tải lên tối thiểu 1 ảnh bằng chứng sau khi hoàn tất!');
      return;
    }
    setIsSubmittingEvidence(true);
    try {
      const formData = new FormData();
      evidenceFiles.forEach((file) => formData.append('evidence', file));
      await bookingApi.completeBooking(completingBooking._id || completingBooking.id, formData);
      alert('Báo hoàn thành thành công! Khách hàng sẽ kiểm tra & thanh toán VietQR.');
      setCompletingBooking(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi nộp bằng chứng');
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Danh sách ca công ty đang phụ trách</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tiến độ, bắt đầu làm việc và nộp ảnh bằng chứng để hoàn tất ca
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full font-bold transition-all disabled:opacity-50"
        >
          {isLoading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {companyBookings.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Doanh nghiệp chưa nhận ca nào. Hãy chuyển sang tab "Chợ việc làm B2B" để nhận việc.
        </div>
      ) : (
        <div className="space-y-4">
          {companyBookings.map((b) => {
            const statusInfo = getBookingStatusInfo(b.status);
            const isUpcoming = b.status === 'UPCOMING' || b.status === 'Sắp diễn ra';
            const isInProgress = b.status === 'IN_PROGRESS' || b.status === 'Đang thực hiện';
            const isAwaiting = b.status === 'AWAITING_PAYMENT';
            const isCompleted = b.status === 'COMPLETED' || b.status === 'Đã hoàn thành';

            return (
              <div
                key={b._id || b.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {b.bookingCode || 'BK-CA'}
                    </span>
                    <h4 className="text-base font-black text-slate-900">{b.service}</h4>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.bgClass}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>Thời gian: <strong>{b.date} lúc {b.time}</strong></div>
                    <div className="line-clamp-1">Địa chỉ: {b.address}</div>
                    <div>Khách hàng: <strong>{b.customerName || 'Khách hàng'}</strong> ({b.customerPhone || '098...'})</div>
                    <div className="text-amber-800 font-semibold">
                      Nhân viên phụ trách: <strong>{b.assignedEmployee?.name || b.helper || 'Đang cập nhật'}</strong>
                      {b.assignedEmployee?.phone ? ` (${b.assignedEmployee.phone})` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Doanh thu ca: <strong>{b.price}</strong></div>
                    <div className="text-xs text-emerald-600 font-bold">
                      Thực nhận (88%): {formatVND(b.helperEarnings || Math.round((b.totalPrice || 0) * 0.88))}
                    </div>
                  </div>

                  {isUpcoming && (
                    <button
                      disabled={actionLoadingId === (b._id || b.id)}
                      onClick={() => handleStartBooking(b._id || b.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Bắt đầu ca làm</span>
                    </button>
                  )}

                  {isInProgress && (
                    <button
                      disabled={actionLoadingId === (b._id || b.id)}
                      onClick={() => openCompleteModal(b)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all animate-pulse"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Báo hoàn thành (Tải ảnh)</span>
                    </button>
                  )}

                  {isAwaiting && (
                    <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl font-semibold">
                      Chờ Admin xác nhận VietQR
                    </span>
                  )}

                  {isCompleted && (
                    <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Tiền đã vào ví</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal nộp bằng chứng */}
      {completingBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Nộp ảnh bằng chứng hoàn thành</h3>
                <p className="text-[11px] text-slate-400">Ca: {completingBooking.service} ({completingBooking.bookingCode})</p>
              </div>
              <button onClick={() => setCompletingBooking(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ảnh bằng chứng sau khi hoàn tất (Tối đa 5 ảnh) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleEvidenceFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
              </div>

              {evidencePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {evidencePreviews.map((src, idx) => (
                    <img key={idx} src={src} alt="Evidence" className="w-full h-20 object-cover rounded-xl border border-slate-200" />
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingBooking(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvidence}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmittingEvidence ? 'Đang gửi...' : 'Nộp ảnh & Báo hoàn thành'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleTab;
