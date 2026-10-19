import React, { useState } from 'react';
import { Calendar, MapPin, Phone, CheckCircle2, PlayCircle, Upload, X } from 'lucide-react';
import bookingApi from '../../../api/bookingApi';
import { getBookingStatusInfo } from '../../../utils/bookingStatus';
import { formatVND } from '../../../utils/serviceUtils';

const ScheduleTab = ({ bookings = [], onDataChanged }) => {
  const [activeSubTab, setActiveSubTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DONE'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Evidence Modal state for completing job
  const [completingBooking, setCompletingBooking] = useState(null);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidencePreviews, setEvidencePreviews] = useState([]);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  const handleStart = async (bookingId) => {
    if (!window.confirm('Bạn đã có mặt tại địa chỉ làm việc và muốn bấm Bắt đầu ca?')) return;
    setActionLoadingId(bookingId);
    try {
      await bookingApi.startBooking(bookingId);
      alert('Đã bắt đầu ca làm việc! Chúc bạn hoàn thành tốt công việc.');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi bắt đầu ca');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openCompleteModal = (booking) => {
    setCompletingBooking(booking);
    setEvidenceFiles([]);
    setEvidencePreviews([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (evidenceFiles.length + files.length > 5) {
      alert('Tối đa 5 ảnh/video bằng chứng hoàn thành ca!');
      return;
    }
    const newFiles = [...evidenceFiles, ...files];
    setEvidenceFiles(newFiles);
    const newPreviews = files.map((f) => ({
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(f.name),
      name: f.name,
    }));
    setEvidencePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
    setEvidencePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (evidenceFiles.length === 0) {
      alert('Bắt buộc tải lên tối thiểu 1 ảnh bằng chứng sau khi dọn dẹp!');
      return;
    }

    setIsSubmittingEvidence(true);
    try {
      const formData = new FormData();
      evidenceFiles.forEach((file) => {
        formData.append('evidence', file);
      });

      await bookingApi.completeBooking(completingBooking._id || completingBooking.id, formData);
      alert('Ca làm việc đã hoàn tất! Đơn đã chuyển sang trạng thái Chờ thanh toán.');
      setCompletingBooking(null);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi nộp bằng chứng');
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  const handleCancelRequest = async (bookingId) => {
    const reason = window.prompt('Nhập lý do gửi yêu cầu hủy ca:');
    if (!reason) return;
    setActionLoadingId(bookingId);
    try {
      const res = await bookingApi.cancelBooking(bookingId, { reason });
      alert(res.message || 'Đã gửi yêu cầu hủy ca!');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi hủy ca');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    if (activeSubTab === 'ACTIVE') return ['UPCOMING', 'IN_PROGRESS', 'Sắp diễn ra', 'Đang thực hiện'].includes(b.status);
    if (activeSubTab === 'DONE') return ['COMPLETED', 'AWAITING_PAYMENT', 'Đã hoàn thành'].includes(b.status);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Sub tabs */}
      <div className="flex gap-2 border-b pb-3">
        <button
          onClick={() => setActiveSubTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'ALL' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
        >
          Tất cả ({bookings.length})
        </button>
        <button
          onClick={() => setActiveSubTab('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'ACTIVE' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
        >
          Đang thực hiện / Sắp diễn ra
        </button>
        <button
          onClick={() => setActiveSubTab('DONE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'DONE' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
        >
          Đã xong / Chờ thanh toán
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm font-bold text-slate-600">Không có ca làm việc nào trong mục này</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const statusInfo = getBookingStatusInfo(item.status);
            const earnings = item.helperEarnings || Math.round((item.totalPrice || 0) * 0.8);
            const isUpcoming = item.status === 'UPCOMING' || item.status === 'Sắp diễn ra';
            const isInProgress = item.status === 'IN_PROGRESS' || item.status === 'Đang thực hiện';
            const isAwaitingPayment = item.status === 'AWAITING_PAYMENT';

            return (
              <div
                key={item._id || item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {item.bookingCode}
                    </span>
                    <h4 className="text-base font-black text-slate-900">{item.service}</h4>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.bgClass}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.date} lúc <strong>{item.time}</strong> ({item.durationHours} giờ)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.address}</span>
                    </div>
                    {item.customerPhone && (
                      <div className="flex items-center gap-2 text-blue-600 font-bold">
                        <Phone className="w-3.5 h-3.5" />
                        <span>SĐT khách: {item.customerPhone} ({item.customerName})</span>
                      </div>
                    )}
                  </div>

                  {item.evidence && item.evidence.length > 0 && (
                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500">Ảnh bằng chứng:</span>
                      <div className="flex gap-1.5">
                        {item.evidence.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg overflow-hidden border">
                            <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0">
                  <div>
                    <div className="text-[11px] text-slate-400">Thu nhập ca:</div>
                    <div className="text-base font-black text-emerald-600">{formatVND(earnings)}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isUpcoming && (
                      <>
                        <button
                          onClick={() => handleStart(item._id || item.id)}
                          disabled={actionLoadingId === (item._id || item.id)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Bắt đầu ca</span>
                        </button>
                        <button
                          onClick={() => handleCancelRequest(item._id || item.id)}
                          className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl"
                        >
                          Hủy ca
                        </button>
                      </>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => openCompleteModal(item)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Hoàn thành ca (Nộp ảnh)</span>
                      </button>
                    )}

                    {isAwaitingPayment && (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                        Chờ khách thanh toán
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Evidence Upload Modal */}
      {completingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Nộp bằng chứng hoàn thành ca</h3>
                <p className="text-xs text-slate-500 mt-0.5">{completingBooking.service} • {completingBooking.bookingCode}</p>
              </div>
              <button onClick={() => setCompletingBooking(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Quy định bắt buộc: Tải lên tối thiểu <strong>1 ảnh hoặc video ngắn</strong> chụp hiện trạng nhà sau khi hoàn tất dọn dẹp (tối đa 5 tệp, lưu trữ đám mây Cloudinary).
            </p>

            <div className="space-y-3">
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer block bg-slate-50/50">
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <span className="text-xs font-bold text-blue-600">Chọn ảnh hoặc video bằng chứng từ thiết bị</span>
                <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
              </label>

              {evidencePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {evidencePreviews.map((preview, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border bg-black/5">
                      {preview?.isVideo ? (
                        <video src={preview.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={preview?.url || preview} alt="Evidence" className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompletingBooking(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSubmittingEvidence || evidenceFiles.length === 0}
                onClick={handleCompleteSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                {isSubmittingEvidence ? 'Đang tải lên...' : 'Xác nhận hoàn thành ca'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleTab;
