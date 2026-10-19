import React, { useState } from 'react';
import { Calendar, MapPin, Phone, CheckCircle2, PlayCircle, Upload, X, AlertOctagon, Receipt } from 'lucide-react';
import bookingApi from '../../../api/bookingApi';
import disputeApi from '../../../api/disputeApi';
import axiosClient from '../../../api/axiosClient';
import { getBookingStatusInfo } from '../../../utils/bookingStatus';
import { formatVND } from '../../../utils/serviceUtils';

const ScheduleTab = ({ bookings = [], onDataChanged }) => {
  const [activeSubTab, setActiveSubTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DONE'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Evidence Modal state for completing job
  const [completingBooking, setCompletingBooking] = useState(null);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidencePreviews, setEvidencePreviews] = useState([]);
  const [actualGroceryFee, setActualGroceryFee] = useState('');
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  // Absent report modal
  const [absentBooking, setAbsentBooking] = useState(null);
  const [absentReason, setAbsentReason] = useState('Khách không mở cửa / không liên lạc được');
  const [absentFiles, setAbsentFiles] = useState([]);
  const [isSubmittingAbsent, setIsSubmittingAbsent] = useState(false);

  // Dispute modal
  const [disputeBooking, setDisputeBooking] = useState(null);
  const [disputeReason, setDisputeReason] = useState('Khách yêu cầu thêm việc ngoài hợp đồng không trả phí');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

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
    setActualGroceryFee(booking.pricingSnapshot?.advanceFee || '');
    setReceiptFiles([]);
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

      if (completingBooking.pricingSnapshot?.advanceFee > 0) {
        formData.append('actualGroceryFee', Number(actualGroceryFee) || 0);
        // Upload receipt images to Cloudinary if selected
        if (receiptFiles.length > 0) {
          for (const rf of receiptFiles) {
            const rFormData = new FormData();
            rFormData.append('file', rf);
            rFormData.append('folder', 'giupviec24/receipts');
            const uploadRes = await axiosClient.post('/kyc/upload', rFormData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (uploadRes.data?.url) {
              formData.append('groceryReceiptUrls', uploadRes.data.url);
            }
          }
        }
      }

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

  const handleRespondCancel = async (bookingId, action) => {
    const promptText = action === 'accept'
      ? 'Xác nhận đồng ý yêu cầu hủy ca của khách hàng (miễn phí)?'
      : 'Xác nhận từ chối yêu cầu hủy ca?';
    if (!window.confirm(promptText)) return;

    try {
      await bookingApi.respondCancelRequest(bookingId, { action });
      alert('Đã phản hồi yêu cầu hủy ca!');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi phản hồi yêu cầu hủy');
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

  const handleReportAbsent = async (e) => {
    e.preventDefault();
    setIsSubmittingAbsent(true);
    try {
      let urls = [];
      if (absentFiles.length > 0) {
        for (const f of absentFiles) {
          const fd = new FormData();
          fd.append('file', f);
          fd.append('folder', 'giupviec24/absent');
          const r = await axiosClient.post('/kyc/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          if (r.data?.url) urls.push(r.data.url);
        }
      }

      await bookingApi.reportNoshow(absentBooking._id || absentBooking.id, {
        reason: absentReason,
        evidenceUrls: urls,
      });

      alert('Đã gửi báo cáo Khách không có mặt. Admin sẽ kiểm tra và giải quyết cho bạn.');
      setAbsentBooking(null);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi gửi báo cáo');
    } finally {
      setIsSubmittingAbsent(false);
    }
  };

  const handleCreateDispute = async (e) => {
    e.preventDefault();
    if (!disputeDesc) return alert('Vui lòng mô tả chi tiết');
    setIsSubmittingDispute(true);
    try {
      await disputeApi.createDispute({
        bookingId: disputeBooking._id || disputeBooking.id,
        reason: disputeReason,
        description: disputeDesc,
      });
      alert('Đã gửi khiếu nại ca làm việc thành công!');
      setDisputeBooking(null);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi gửi khiếu nại');
    } finally {
      setIsSubmittingDispute(false);
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

                  {/* Banner Yêu Cầu Hủy Đơn 2 Chiều */}
                  {item.cancelRequest && item.cancelRequest.requestedBy && item.cancelRequest.requestedRole !== 'helper' && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-rose-800">
                          Khách hàng yêu cầu hủy ca: "{item.cancelRequest.reason}"
                        </p>
                        <p className="text-rose-600 mt-0.5">Bấm đồng ý để xác nhận hủy ca miễn phí.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRespondCancel(item._id || item.id, 'reject')}
                          className="px-2.5 py-1 bg-white border border-rose-300 text-rose-700 font-bold rounded-lg hover:bg-rose-50"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleRespondCancel(item._id || item.id, 'accept')}
                          className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700"
                        >
                          Đồng ý hủy
                        </button>
                      </div>
                    </div>
                  )}

                  {item.cancelRequest && item.cancelRequest.requestedBy && item.cancelRequest.requestedRole === 'helper' && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      Yêu cầu hủy ca của bạn đang chờ khách hàng xác nhận.
                    </div>
                  )}

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
                          onClick={() => setAbsentBooking(item)}
                          className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-xl"
                          title="Báo khách không có mặt tại địa chỉ"
                        >
                          Báo vắng mặt
                        </button>
                        {(!item.cancelRequest || !item.cancelRequest.requestedBy) && (
                          <button
                            onClick={() => handleCancelRequest(item._id || item.id)}
                            className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl"
                          >
                            Hủy ca
                          </button>
                        )}
                      </>
                    )}

                    {isInProgress && (
                      <>
                        <button
                          onClick={() => openCompleteModal(item)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Hoàn thành ca (Nộp ảnh)</span>
                        </button>
                        <button
                          onClick={() => setAbsentBooking(item)}
                          className="px-2.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-xl"
                        >
                          Báo khách vắng
                        </button>
                      </>
                    )}

                    {isAwaitingPayment && (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                        Chờ khách thanh toán
                      </span>
                    )}

                    {item.status === 'COMPLETED' && (
                      <button
                        onClick={() => setDisputeBooking(item)}
                        className="px-2.5 py-1 border border-purple-300 text-purple-700 hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Khiếu nại
                      </button>
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

            {/* Mục Đi chợ hộ thực tế (COOKING) */}
            {completingBooking.pricingSnapshot?.advanceFee > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Receipt className="w-4 h-4 text-amber-700" />
                  <span>Quyết toán tiền đi chợ hộ (Ngân sách tối đa: {formatVND(completingBooking.pricingSnapshot.advanceFee)})</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">Số tiền thực phẩm thực tế đã chi (VNĐ):</label>
                  <input
                    type="number"
                    value={actualGroceryFee}
                    onChange={(e) => setActualGroceryFee(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    placeholder="Nhập số tiền thực tế..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">Ảnh hóa đơn thực phẩm (tùy chọn):</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setReceiptFiles(Array.from(e.target.files))}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800"
                  />
                </div>
              </div>
            )}

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

      {/* Modal Báo khách không có mặt */}
      {absentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleReportAbsent} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Báo khách không có mặt #{absentBooking.bookingCode}</h3>
              <button type="button" onClick={() => setAbsentBooking(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả tình huống tại hiện trường:</label>
              <textarea
                value={absentReason}
                onChange={(e) => setAbsentReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ảnh chụp tại địa chỉ hiện trường (tùy chọn):</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setAbsentFiles(Array.from(e.target.files))}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setAbsentBooking(null)} className="px-4 py-2 border rounded-xl text-xs font-bold">Hủy</button>
              <button type="submit" disabled={isSubmittingAbsent} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl">Gửi báo cáo</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Khiếu nại */}
      {disputeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleCreateDispute} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Khiếu nại ca #{disputeBooking.bookingCode}</h3>
              <button type="button" onClick={() => setDisputeBooking(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lý do khiếu nại:</label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm bg-white"
              >
                <option value="Khách yêu cầu thêm việc ngoài hợp đồng không trả phí">Khách yêu cầu thêm việc ngoài hợp đồng không trả phí</option>
                <option value="Thái độ khách hàng xúc phạm">Thái độ khách hàng xúc phạm</option>
                <option value="Khách khai báo sai khối lượng công việc">Khách khai báo sai khối lượng công việc</option>
                <option value="Vấn đề thanh toán / tiền ứng">Vấn đề thanh toán / tiền ứng</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả chi tiết:</label>
              <textarea
                value={disputeDesc}
                onChange={(e) => setDisputeDesc(e.target.value)}
                rows={3}
                placeholder="Ghi rõ tình huống xảy ra..."
                className="w-full p-2.5 border rounded-xl text-sm"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setDisputeBooking(null)} className="px-4 py-2 border rounded-xl text-xs font-bold">Hủy</button>
              <button type="submit" disabled={isSubmittingDispute} className="px-5 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl">Gửi khiếu nại</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ScheduleTab;

