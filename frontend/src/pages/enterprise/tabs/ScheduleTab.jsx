import React, { useState } from 'react';
import { 
  PlayCircle, 
  Upload, 
  CheckCircle2, 
  X, 
  Receipt, 
  AlertOctagon 
} from 'lucide-react';
import { getBookingStatusInfo } from '../../../utils/bookingStatus';
import { formatVND } from '../../../utils/serviceUtils';
import bookingApi from '../../../api/bookingApi';
import disputeApi from '../../../api/disputeApi';
import axiosClient from '../../../api/axiosClient';

const ScheduleTab = ({ companyBookings = [], isLoading = false, onRefresh, employees = [] }) => {
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Evidence modal state
  const [completingBooking, setCompletingBooking] = useState(null);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidencePreviews, setEvidencePreviews] = useState([]);
  const [actualGroceryFee, setActualGroceryFee] = useState('');
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  // Reassign modal state
  const [reassignBooking, setReassignBooking] = useState(null);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [isSubmittingReassign, setIsSubmittingReassign] = useState(false);

  // Absent report modal
  const [absentBooking, setAbsentBooking] = useState(null);
  const [absentReason, setAbsentReason] = useState('Khách không có mặt tại địa chỉ / không liên lạc được');
  const [absentFiles, setAbsentFiles] = useState([]);
  const [isSubmittingAbsent, setIsSubmittingAbsent] = useState(false);

  // Dispute modal
  const [disputeBooking, setDisputeBooking] = useState(null);
  const [disputeReason, setDisputeReason] = useState('Khách yêu cầu thêm việc ngoài hợp đồng không trả phí');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

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
    setActualGroceryFee(booking.pricingSnapshot?.advanceFee || '');
    setReceiptFiles([]);
  };

  const handleEvidenceFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (evidenceFiles.length + files.length > 5) {
      alert('Tối đa 5 ảnh hoặc video bằng chứng hoàn thành ca!');
      return;
    }
    setEvidenceFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => ({
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(f.name),
      name: f.name,
    }));
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

      if (completingBooking.pricingSnapshot?.advanceFee > 0) {
        formData.append('actualGroceryFee', Number(actualGroceryFee) || 0);
        if (receiptFiles.length > 0) {
          for (const rf of receiptFiles) {
            const rFormData = new FormData();
            rFormData.append('file', rf);
            rFormData.append('folder', 'giupviec24/receipts');
            const uploadRes = await axiosClient.post('/kyc/upload', rFormData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (uploadRes.data?.url) formData.append('groceryReceiptUrls', uploadRes.data.url);
          }
        }
      }

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

  const handleRespondCancel = async (bookingId, action) => {
    const promptText = action === 'accept'
      ? 'Xác nhận đồng ý hủy đơn dịch vụ này (miễn phí)?'
      : 'Xác nhận từ chối yêu cầu hủy ca?';
    if (!window.confirm(promptText)) return;

    try {
      await bookingApi.respondCancelRequest(bookingId, { action });
      alert('Đã phản hồi yêu cầu hủy ca!');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi phản hồi yêu cầu hủy');
    }
  };

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) return alert('Vui lòng chọn 1 nhân viên phụ trách');
    setIsSubmittingReassign(true);
    try {
      await bookingApi.reassignEmployee(reassignBooking._id || reassignBooking.id, {
        employeeId: selectedEmpId,
      });
      alert('Đã đổi nhân viên phụ trách ca thành công!');
      setReassignBooking(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi đổi nhân viên');
    } finally {
      setIsSubmittingReassign(false);
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
      alert('Đã gửi báo cáo Khách không có mặt. Admin sẽ kiểm tra hỗ trợ.');
      setAbsentBooking(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi báo vắng');
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
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi gửi khiếu nại');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Danh sách ca công ty đang phụ trách</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tiến độ, đổi nhân sự trước giờ bắt đầu và nộp ảnh bằng chứng để hoàn tất ca
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
                  {/* Banner Yêu Cầu Hủy */}
                  {b.cancelRequest && b.cancelRequest.requestedBy && b.cancelRequest.requestedRole !== 'enterprise' && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs mb-2">
                      <div>
                        <p className="font-bold text-rose-800">Khách hàng yêu cầu hủy ca: "{b.cancelRequest.reason}"</p>
                        <p className="text-rose-600 mt-0.5">Bấm đồng ý để xác nhận hủy ca miễn phí.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRespondCancel(b._id || b.id, 'reject')}
                          className="px-2.5 py-1 bg-white border border-rose-300 text-rose-700 font-bold rounded-lg hover:bg-rose-50"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleRespondCancel(b._id || b.id, 'accept')}
                          className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700"
                        >
                          Đồng ý hủy
                        </button>
                      </div>
                    </div>
                  )}

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
                    <div className="text-amber-800 font-semibold flex items-center gap-2">
                      <span>Nhân viên: <strong>{b.assignedEmployee?.name || b.helper || 'Chưa gán'}</strong></span>
                      {isUpcoming && (
                        <button
                          onClick={() => {
                            setReassignBooking(b);
                            setSelectedEmpId(b.assignedEmployee?.id || '');
                          }}
                          className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold"
                        >
                          Đổi nhân viên
                        </button>
                      )}
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

                  <div className="flex items-center gap-2">
                    {isUpcoming && (
                      <>
                        <button
                          disabled={actionLoadingId === (b._id || b.id)}
                          onClick={() => handleStartBooking(b._id || b.id)}
                          className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> Bắt đầu ca
                        </button>
                        <button
                          onClick={() => setAbsentBooking(b)}
                          className="px-2.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-xl"
                        >
                          Báo vắng
                        </button>
                      </>
                    )}

                    {isInProgress && (
                      <>
                        <button
                          onClick={() => openCompleteModal(b)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành ca
                        </button>
                        <button
                          onClick={() => setAbsentBooking(b)}
                          className="px-2.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-xl"
                        >
                          Báo vắng
                        </button>
                      </>
                    )}

                    {isAwaiting && (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                        Đang chờ khách thanh toán VietQR
                      </span>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => setDisputeBooking(b)}
                        className="px-2.5 py-1 border border-purple-300 text-purple-700 hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <AlertOctagon className="w-3.5 h-3.5" /> Khiếu nại
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Đổi nhân viên phụ trách */}
      {reassignBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleReassign} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Đổi nhân viên ca #{reassignBooking.bookingCode}</h3>
              <button type="button" onClick={() => setReassignBooking(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn nhân viên thay thế:</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm bg-white"
                required
              >
                <option value="">-- Chọn nhân viên sẵn sàng --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.phone || 'Không SĐT'})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setReassignBooking(null)} className="px-4 py-2 border rounded-xl text-xs font-bold">Hủy</button>
              <button type="submit" disabled={isSubmittingReassign} className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl">Lưu thay đổi</button>
            </div>
          </form>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả tình huống:</label>
              <textarea
                value={absentReason}
                onChange={(e) => setAbsentReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 border rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ảnh tại hiện trường:</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setAbsentFiles(Array.from(e.target.files))}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-rose-50 file:text-rose-700"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setAbsentBooking(null)} className="px-4 py-2 border rounded-xl text-xs font-bold">Hủy</button>
              <button type="submit" disabled={isSubmittingAbsent} className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl">Gửi báo cáo</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Hoàn thành ca */}
      {completingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Nộp bằng chứng hoàn thành ca</h3>
              <button onClick={() => setCompletingBooking(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

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
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">Ảnh hóa đơn thực phẩm (tùy chọn):</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setReceiptFiles(Array.from(e.target.files))}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-amber-100 file:text-amber-800"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer block bg-slate-50/50">
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <span className="text-xs font-bold text-amber-600">Tải ảnh hoặc video bằng chứng hiện trường</span>
                <input type="file" multiple accept="image/*,video/*" onChange={handleEvidenceFileChange} className="hidden" />
              </label>

              {evidencePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {evidencePreviews.map((preview, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border">
                      {preview?.isVideo ? (
                        <video src={preview.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={preview?.url || preview} alt="Preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompletingBooking(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSubmittingEvidence || evidenceFiles.length === 0}
                onClick={handleCompleteSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                {isSubmittingEvidence ? 'Đang tải lên...' : 'Xác nhận hoàn thành'}
              </button>
            </div>
          </div>
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
