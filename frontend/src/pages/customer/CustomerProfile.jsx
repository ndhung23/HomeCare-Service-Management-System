import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Plus, 
  Star,
  X,
  QrCode,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import bookingApi from '../../api/bookingApi';
import paymentApi from '../../api/paymentApi';
import reviewApi from '../../api/reviewApi';
import { getBookingStatusInfo } from '../../utils/bookingStatus';
import { formatVND } from '../../utils/serviceUtils';

const CustomerProfile = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'profile'

  // Modals
  const [paymentModalData, setPaymentModalData] = useState(null);
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [evidenceModalPhotos, setEvidenceModalPhotos] = useState(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingApi.getBookings();
      setBookings(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (booking) => {
    const isPending = booking.status === 'PENDING' || booking.status === 'Chờ người nhận';
    const confirmPrompt = isPending
      ? 'Bạn có chắc chắn muốn hủy đơn dịch vụ này (Miễn phí)?'
      : 'Đơn đã có người nhận. Bạn có muốn gửi yêu cầu hủy đơn tới Người giúp việc?';

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

  const handleOpenPayment = async (booking) => {
    try {
      const data = await paymentApi.getPaymentInfo(booking._id || booking.id);
      setPaymentModalData(data);
    } catch (err) {
      alert('Không thể tải thông tin thanh toán VietQR lúc này!');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Vui lòng viết nhận xét dịch vụ!');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewApi.createReview({
        bookingId: reviewModalBooking._id || reviewModalBooking.id,
        rating,
        comment,
        service: reviewModalBooking.service,
        helper: reviewModalBooking.helper,
      });
      alert('Cảm ơn bạn đã gửi đánh giá dịch vụ!');
      setReviewModalBooking(null);
      setComment('');
      setRating(5);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi gửi đánh giá');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const customerNav = [
    { key: 'bookings', label: 'Lịch sử đặt dịch vụ', active: activeTab === 'bookings', onClick: () => setActiveTab('bookings'), icon: Calendar, badge: bookings.length > 0 ? `${bookings.length}` : null },
    { key: 'profile', label: 'Hồ sơ tài khoản', active: activeTab === 'profile', onClick: () => setActiveTab('profile'), icon: User },
  ];

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'PENDING') return b.status === 'PENDING' || b.status === 'Chờ người nhận';
    if (filterStatus === 'UPCOMING') return b.status === 'UPCOMING' || b.status === 'Sắp diễn ra';
    if (filterStatus === 'IN_PROGRESS') return b.status === 'IN_PROGRESS' || b.status === 'Đang thực hiện';
    if (filterStatus === 'AWAITING_PAYMENT') return b.status === 'AWAITING_PAYMENT';
    if (filterStatus === 'COMPLETED') return b.status === 'COMPLETED' || b.status === 'Đã hoàn thành';
    if (filterStatus === 'CANCELLED') return b.status === 'CANCELLED' || b.status === 'Đã hủy';
    return true;
  });

  return (
    <DashboardLayout
      roleBadge="Khách hàng"
      roleColor="blue"
      sidebarNav={customerNav}
      activeTab={activeTab}
      onTabChange={(tabKey) => setActiveTab(tabKey)}
      pageTitle="Trang cá nhân Khách hàng"
      pageSubtitle="Theo dõi tiến độ ca giúp việc và lịch sử đặt dịch vụ"
    >
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <img 
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'} 
            alt="Customer avatar" 
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user?.name}</h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-100">
                Khách hàng
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}</span>
              {user?.phone && <span>•</span>}
              {user?.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {user?.phone}</span>}
            </div>
          </div>
        </div>

        <Link 
          to="/#services" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Đặt dịch vụ mới</span>
        </Link>
      </div>

      {/* Bookings Container */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Danh sách đơn dịch vụ</h3>
            <p className="text-xs text-slate-500 mt-0.5">Quản lý trạng thái, bằng chứng ca và thanh toán qua QR</p>
          </div>
          <button onClick={fetchBookings} className="p-2 border rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center gap-1 self-start sm:self-auto">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Cập nhật</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'PENDING', label: 'Chờ người nhận' },
            { key: 'UPCOMING', label: 'Sắp diễn ra' },
            { key: 'IN_PROGRESS', label: 'Đang làm' },
            { key: 'AWAITING_PAYMENT', label: 'Chờ thanh toán' },
            { key: 'COMPLETED', label: 'Đã hoàn thành' },
            { key: 'CANCELLED', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === tab.key ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-xs font-bold">Không có đơn dịch vụ nào trong mục này</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((item) => {
              const statusInfo = getBookingStatusInfo(item.status);
              const isPending = item.status === 'PENDING' || item.status === 'Chờ người nhận';
              const isUpcoming = item.status === 'UPCOMING' || item.status === 'Sắp diễn ra';
              const isAwaitingPayment = item.status === 'AWAITING_PAYMENT';
              const isCompleted = item.status === 'COMPLETED' || item.status === 'Đã hoàn thành';

              return (
                <div key={item._id || item.id} className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {item.bookingCode}
                      </span>
                      <span className="font-extrabold text-slate-900 text-base">{item.service}</span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.bgClass}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.date} lúc <strong>{item.time}</strong> ({item.durationHours} giờ)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Người nhận: <strong>{item.helper}</strong></span>
                        {item.helperPhone && <span className="text-blue-600">({item.helperPhone})</span>}
                      </div>
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.address}</span>
                      </div>
                    </div>

                    {/* Evidence preview if uploaded */}
                    {item.evidence && item.evidence.length > 0 && (
                      <div className="pt-1 flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500">Ảnh nghiệm thu:</span>
                        <div className="flex gap-1.5">
                          {item.evidence.map((url, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setEvidenceModalPhotos(item.evidence)}
                              className="w-7 h-7 rounded-md overflow-hidden border hover:opacity-80"
                            >
                              <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions & Price */}
                  <div className="text-right flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0">
                    <div className="font-black text-slate-900 text-base sm:text-lg">
                      {item.price || formatVND(item.totalPrice)}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {isPending && (
                        <button
                          onClick={() => handleCancel(item)}
                          className="px-3 py-1.5 text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-xl"
                        >
                          Hủy đơn
                        </button>
                      )}

                      {isUpcoming && (
                        <button
                          onClick={() => handleCancel(item)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-600 border hover:bg-slate-50 rounded-xl"
                        >
                          Yêu cầu hủy
                        </button>
                      )}

                      {isAwaitingPayment && (
                        <button
                          onClick={() => handleOpenPayment(item)}
                          className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs flex items-center gap-1.5 animate-pulse"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>Thanh toán QR</span>
                        </button>
                      )}

                      {isCompleted && !item.isReviewed && (
                        <button
                          onClick={() => setReviewModalBooking(item)}
                          className="px-3.5 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl flex items-center gap-1 border border-blue-200"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>Đánh giá</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      )}

      {/* Account Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Thông tin tài khoản</h3>
            <p className="text-xs text-slate-500 mt-0.5">Quản lý hồ sơ cá nhân và thông tin liên hệ của bạn</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600">Họ và tên</label>
              <div className="p-3 bg-slate-50 border rounded-xl font-semibold text-slate-900">{user?.name}</div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-600">Địa chỉ Email</label>
              <div className="p-3 bg-slate-50 border rounded-xl font-semibold text-slate-900">{user?.email}</div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-600">Số điện thoại</label>
              <div className="p-3 bg-slate-50 border rounded-xl font-semibold text-slate-900">{user?.phone || 'Chưa cập nhật'}</div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-600">Vai trò tài khoản</label>
              <div className="p-3 bg-slate-50 border rounded-xl font-semibold text-blue-700">{user?.roleName || 'Khách hàng'}</div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-600">Trạng thái xác thực</label>
              <div className="p-3 bg-slate-50 border rounded-xl font-semibold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Hoạt động (Active)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-600">Đơn hàng đã đặt</label>
              <div className="p-3 bg-slate-50 border rounded-xl font-semibold text-slate-900">{bookings.length} đơn dịch vụ</div>
            </div>
          </div>
        </div>
      )}

      {/* VietQR Payment Modal */}
      {paymentModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-slate-900">Quét mã VietQR thanh toán</h3>
              <button onClick={() => setPaymentModalData(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border">
              <img src={paymentModalData.qrUrl} alt="VietQR" className="w-56 h-56 mx-auto rounded-xl shadow-xs" />
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-blue-50/70 p-3 rounded-xl text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Số tiền:</span>
                <span className="font-black text-blue-700 text-sm">{formatVND(paymentModalData.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ngân hàng:</span>
                <span className="font-bold">{paymentModalData.bank.bankId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số tài khoản:</span>
                <span className="font-bold">{paymentModalData.bank.accountNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nội dung CK:</span>
                <span className="font-extrabold text-slate-900">{paymentModalData.transferContent}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Sau khi bạn chuyển khoản, Admin sẽ xác nhận thanh toán và giải ngân thu nhập vào ví Người giúp việc.
            </p>

            <button
              onClick={() => {
                setPaymentModalData(null);
                fetchBookings();
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Tôi đã chuyển khoản xong
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleSubmitReview} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Đánh giá dịch vụ</h3>
                <p className="text-xs text-slate-500 mt-0.5">{reviewModalBooking.service} • {reviewModalBooking.helper}</p>
              </div>
              <button type="button" onClick={() => setReviewModalBooking(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="text-xs text-slate-500 mb-2 font-bold">Mức độ hài lòng của bạn:</div>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nhận xét chi tiết</label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Người giúp việc đến đúng giờ, dọn dẹp cẩn thận, thái độ thân thiện..."
                className="w-full p-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 resize-none"
              />
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewModalBooking(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Bỏ qua
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Evidence Photos Viewer Modal */}
      {evidenceModalPhotos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-slate-900">Bằng chứng hoàn thành ca</h3>
              <button onClick={() => setEvidenceModalPhotos(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {evidenceModalPhotos.map((url, i) => {
                const isVideo = /\.(mp4|mov|webm)(\?.*)?$/i.test(url) || url.includes('/video/upload/');
                return isVideo ? (
                  <div key={i} className="rounded-xl overflow-hidden border bg-black">
                    <video controls src={url} className="w-full h-44 object-cover" />
                  </div>
                ) : (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="rounded-xl overflow-hidden border block bg-slate-50">
                    <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-44 object-cover hover:scale-105 transition-transform" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerProfile;
