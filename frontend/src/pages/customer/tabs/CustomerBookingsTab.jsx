import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Star, 
  Film, 
  QrCode, 
  AlertTriangle, 
  X,
  AlertOctagon,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBookingStatusInfo } from '../../../utils/bookingStatus';
import { formatVND } from '../../../utils/serviceUtils';
import bookingApi from '../../../api/bookingApi';
import disputeApi from '../../../api/disputeApi';
import reviewApi from '../../../api/reviewApi';
import paymentApi from '../../../api/paymentApi';
import axiosClient from '../../../api/axiosClient';

const CustomerBookingsTab = ({ bookings, isLoading, fetchBookings }) => {
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals
  const [paymentModalData, setPaymentModalData] = useState(null);
  const [evidenceModalPhotos, setEvidenceModalPhotos] = useState(null);
  
  // Review modal
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [existingReviewId, setExistingReviewId] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Dispute modal
  const [disputeBooking, setDisputeBooking] = useState(null);
  const [disputeReason, setDisputeReason] = useState('Chất lượng công việc không đạt');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeFiles, setDisputeFiles] = useState([]);
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  const handleCancel = async (booking) => {
    const isPending = booking.status === 'PENDING' || booking.status === 'Chờ người nhận';
    const confirmPrompt = isPending
      ? 'Bạn có chắc chắn muốn hủy đơn dịch vụ này (Miễn phí)?'
      : 'Đơn đã có người nhận. Bạn có muốn gửi yêu cầu hủy đơn tới Người giúp việc để hai bên đồng thuận?';

    if (!window.confirm(confirmPrompt)) return;
    const reason = window.prompt('Nhập lý do hủy đơn (tùy chọn):') || 'Khách hàng thay đổi kế hoạch';

    try {
      const res = await bookingApi.cancelBooking(booking._id || booking.id, { reason });
      alert(res.message || 'Thao tác hủy đơn thành công!');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn!');
    }
  };

  const handleRespondCancel = async (bookingId, action) => {
    const promptText = action === 'accept'
      ? 'Xác nhận đồng ý hủy đơn dịch vụ này (miễn phí)?'
      : 'Xác nhận từ chối yêu cầu hủy đơn (ca làm việc vẫn diễn ra)?';
    if (!window.confirm(promptText)) return;

    try {
      await bookingApi.respondCancelRequest(bookingId, { action });
      alert('Đã phản hồi yêu cầu hủy thành công!');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi phản hồi yêu cầu hủy');
    }
  };

  const handleReportNoshow = async (booking) => {
    if (!window.confirm('Xác nhận báo cáo người giúp việc vắng mặt quá 30 phút sau giờ hẹn? Ca sẽ được đẩy lại Chợ việc làm.')) return;
    try {
      await bookingApi.reportNoshow(booking._id || booking.id, {
        reason: 'Khách báo người làm vắng mặt quá 30 phút sau giờ hẹn',
      });
      alert('Đã ghi nhận báo cáo vắng mặt. Ca đã được đẩy lại Chợ việc làm để tìm người thay thế.');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi báo vắng mặt');
    }
  };

  const handleOpenPayment = async (booking) => {
    try {
      const data = await paymentApi.getPaymentInfo(booking._id || booking.id);
      setPaymentModalData(data);
    } catch (err) {
      alert('Không thể tải thông tin thanh toán VietQR lúc này!');
    }
  };

  const handleOpenReview = (booking) => {
    setReviewBooking(booking);
    setRating(5);
    setComment('');
    setExistingReviewId(null);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Vui lòng viết nhận xét dịch vụ!');
      return;
    }

    setIsSubmittingReview(true);
    try {
      if (existingReviewId) {
        await reviewApi.updateReview(existingReviewId, { rating, comment });
        alert('Đã cập nhật đánh giá thành công!');
      } else {
        await reviewApi.createReview({
          bookingId: reviewBooking._id || reviewBooking.id,
          rating,
          comment,
          service: reviewBooking.service,
          helper: reviewBooking.helper,
        });
        alert('Cảm ơn bạn đã gửi đánh giá dịch vụ!');
      }
      setReviewBooking(null);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSubmitDispute = async (e) => {
    e.preventDefault();
    if (!disputeDesc.trim()) {
      alert('Vui lòng mô tả chi tiết vấn đề bạn gặp phải');
      return;
    }

    setIsSubmittingDispute(true);
    try {
      let uploadedUrls = [];
      if (disputeFiles.length > 0) {
        for (const file of disputeFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', 'giupviec24/disputes');
          const res = await axiosClient.post('/kyc/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (res.data?.url) uploadedUrls.push(res.data.url);
        }
      }

      await disputeApi.createDispute({
        bookingId: disputeBooking._id || disputeBooking.id,
        reason: disputeReason,
        description: disputeDesc,
        evidenceUrls: uploadedUrls,
      });

      alert('Đã gửi khiếu nại thành công! Đơn đã chuyển sang trạng thái tranh chấp và Admin sẽ sớm liên hệ xử lý.');
      setDisputeBooking(null);
      setDisputeDesc('');
      setDisputeFiles([]);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi gửi khiếu nại');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bộ lọc trạng thái */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PENDING', label: 'Chờ nhận' },
            { id: 'UPCOMING', label: 'Sắp diễn ra' },
            { id: 'IN_PROGRESS', label: 'Đang làm' },
            { id: 'AWAITING_PAYMENT', label: 'Chờ thanh toán' },
            { id: 'COMPLETED', label: 'Hoàn thành' },
            { id: 'DISPUTED', label: 'Khiếu nại' },
            { id: 'CANCELLED', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchBookings} className="p-2 border rounded-lg bg-white hover:bg-gray-50 text-gray-600">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/services"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Đặt lịch mới
          </Link>
        </div>
      </div>

      {/* Danh sách đơn */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Không tìm thấy đơn dịch vụ nào trong mục này</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const statusInfo = getBookingStatusInfo(b.status);
            const isCompleted = b.status === 'COMPLETED' || b.status === 'Đã hoàn thành';
            const isAwaitingPayment = b.status === 'AWAITING_PAYMENT';
            const isUpcoming = b.status === 'UPCOMING' || b.status === 'Sắp diễn ra';
            const isPending = b.status === 'PENDING' || b.status === 'Chờ người nhận';
            
            // Check mutual cancel request
            const hasCancelReq = b.cancelRequest && b.cancelRequest.requestedBy;
            const cancelReqFromWorker = hasCancelReq && b.cancelRequest.requestedRole !== 'customer';
            const cancelReqFromMe = hasCancelReq && b.cancelRequest.requestedRole === 'customer';

            // Check No-show (> 30 min after startAt)
            const isOverdue30m = b.startAt && (Date.now() > new Date(b.startAt).getTime() + 30 * 60 * 1000);

            // Check 24h dispute window
            const canDispute = isCompleted && b.completedAt && (
              Date.now() - new Date(b.completedAt).getTime() <= 24 * 60 * 60 * 1000
            ) && b.status !== 'DISPUTED';

            return (
              <div key={b._id || b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                {/* Banner Yêu Cầu Hủy Đơn 2 Chiều */}
                {cancelReqFromWorker && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-rose-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Người làm gửi yêu cầu hủy ca: "{b.cancelRequest.reason}"
                      </p>
                      <p className="text-rose-600 mt-0.5">SĐT người làm: {b.helperPhone || 'Chưa cập nhật'}. Bấm đồng ý để hủy đơn miễn phí.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespondCancel(b._id, 'reject')}
                        className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 font-semibold rounded-lg hover:bg-rose-50"
                      >
                        Từ chối hủy
                      </button>
                      <button
                        onClick={() => handleRespondCancel(b._id, 'accept')}
                        className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 shadow-sm"
                      >
                        Đồng ý hủy đơn
                      </button>
                    </div>
                  </div>
                )}

                {cancelReqFromMe && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Yêu cầu hủy đơn của bạn đang chờ Người giúp việc xác nhận.
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-gray-900 text-base">#{b.bookingCode}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </span>
                      {b.dispatchMode === 'SPECIFIC' && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-semibold">
                          Đặt đích danh
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">{b.service}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {b.address}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> Ngày làm: {b.date} • {b.time} ({b.durationHours || 2} giờ)
                    </p>
                    <p className="text-xs text-gray-600">
                      Người phụ trách: <span className="font-semibold text-gray-900">{b.helper}</span>
                      {b.helperPhone && <span className="text-gray-500"> ({b.helperPhone})</span>}
                    </p>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <div>
                      <p className="text-xs text-gray-500">Tổng chi phí</p>
                      <p className="text-xl font-black text-emerald-600">{formatVND(b.totalPrice)}</p>
                    </div>
                  </div>
                </div>

                {/* Các nút hành động */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t">
                  {/* Xem bằng chứng hoàn thành */}
                  {b.evidence?.length > 0 && (
                    <button
                      onClick={() => setEvidenceModalPhotos(b.evidence)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Film className="w-3.5 h-3.5 text-indigo-600" />
                      Xem ảnh/video ({b.evidence.length})
                    </button>
                  )}

                  {/* Thanh toán VietQR */}
                  {isAwaitingPayment && (
                    <button
                      onClick={() => handleOpenPayment(b)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Quét mã VietQR thanh toán
                    </button>
                  )}

                  {/* Đánh giá dịch vụ */}
                  {isCompleted && !b.isReviewed && (
                    <button
                      onClick={() => handleOpenReview(b)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Đánh giá dịch vụ
                    </button>
                  )}

                  {/* Khiếu nại ≤ 24h */}
                  {canDispute && (
                    <button
                      onClick={() => setDisputeBooking(b)}
                      className="px-3 py-1.5 border border-purple-300 text-purple-700 hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                      Khiếu nại ca này
                    </button>
                  )}

                  {/* Báo No-show khi quá 30 phút sau startAt */}
                  {isUpcoming && isOverdue30m && (
                    <button
                      onClick={() => handleReportNoshow(b)}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Báo người làm vắng mặt
                    </button>
                  )}

                  {/* Nút hủy đơn */}
                  {(isPending || (isUpcoming && !hasCancelReq)) && (
                    <button
                      onClick={() => handleCancel(b)}
                      className="px-3 py-1.5 text-gray-500 hover:text-rose-600 rounded-lg text-xs font-medium hover:bg-rose-50"
                    >
                      {isPending ? 'Hủy đơn' : 'Gửi yêu cầu hủy'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Khiếu Nại */}
      {disputeBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmitDispute} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Khiếu nại ca #{disputeBooking.bookingCode}</h3>
                <p className="text-xs text-gray-500">Gửi mô tả và bằng chứng ảnh/video để Admin xử lý</p>
              </div>
              <button type="button" onClick={() => setDisputeBooking(null)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lý do khiếu nại</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Chất lượng công việc không đạt">Chất lượng công việc không đạt</option>
                  <option value="Người làm về sớm trước giờ hẹn">Người làm về sớm trước giờ hẹn</option>
                  <option value="Hư hỏng tài sản hoặc mất đồ">Hư hỏng tài sản hoặc mất đồ</option>
                  <option value="Thái độ không phù hợp">Thái độ không phù hợp</option>
                  <option value="Sai lệch hóa đơn thực phẩm">Sai lệch hóa đơn thực phẩm</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mô tả chi tiết</label>
                <textarea
                  placeholder="Mô tả cụ thể vấn đề bạn gặp phải trong hoặc sau ca làm việc..."
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tải ảnh / video bằng chứng</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => setDisputeFiles(Array.from(e.target.files))}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setDisputeBooking(null)}
                className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmittingDispute}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm shadow-sm"
              >
                Gửi khiếu nại
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Đánh Giá */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">Đánh giá dịch vụ #{reviewBooking.bookingCode}</h3>
              <button type="button" onClick={() => setReviewBooking(null)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mức độ hài lòng:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl ${star <= rating ? 'text-amber-500' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nhận xét của bạn:</label>
                <textarea
                  placeholder="Chia sẻ trải nghiệm của bạn về người giúp việc và dịch vụ..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onClick={() => setReviewBooking(null)} className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium">Hủy</button>
              <button type="submit" disabled={isSubmittingReview} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm">Gửi đánh giá</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal VietQR Thanh toán */}
      {paymentModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="font-bold text-gray-900 text-base">Thanh toán qua VietQR</h3>
            <img src={paymentModalData.qrUrl} alt="VietQR" className="w-56 h-56 mx-auto rounded-xl border p-2" />
            <p className="text-xl font-black text-emerald-600">{formatVND(paymentModalData.amount)}</p>
            <p className="text-xs text-gray-500">Nội dung CK: <span className="font-bold text-gray-800">{paymentModalData.bookingCode}</span></p>
            <button onClick={() => setPaymentModalData(null)} className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm">Đã thanh toán</button>
          </div>
        </div>
      )}

      {/* Modal Bằng chứng */}
      {evidenceModalPhotos && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setEvidenceModalPhotos(null)}>
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-gray-900 text-sm">Bằng chứng hoàn thành ca</h4>
              <button onClick={() => setEvidenceModalPhotos(null)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {evidenceModalPhotos.map((url, idx) => {
                const isVideo = url.match(/\.(mp4|mov|webm)$/i) || url.includes('/video/upload/');
                return isVideo ? (
                  <video key={idx} src={url} controls className="w-full h-36 object-cover rounded-lg" />
                ) : (
                  <img key={idx} src={url} alt={`Evidence ${idx}`} className="w-full h-36 object-cover rounded-lg" onClick={() => window.open(url, '_blank')} />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookingsTab;

