import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  Film, 
  X,
  AlertTriangle 
} from 'lucide-react';
import { formatVND } from '../../../utils/serviceUtils';
import adminApi from '../../../api/adminApi';

const PaymentsAndWithdrawsTab = ({
  awaitingBookings,
  paymentHistory,
  paymentSubTab,
  setPaymentSubTab,
  paymentSearch,
  setPaymentSearch,
  isProcessingPayment,
  handleConfirmPayment,
  handleRejectPayment,
  fetchAwaitingPayments,
  fetchPaymentHistory,
  withdraws,
  fetchWithdraws,
}) => {
  const [activeSection, setActiveSection] = useState('PAYMENT'); // 'PAYMENT' | 'WITHDRAW'
  const [activeEvidenceModal, setActiveEvidenceModal] = useState(null);
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(null);

  const handleApproveWithdraw = async (id) => {
    if (!window.confirm('Xác nhận đã chuyển khoản cho người nhận và phê duyệt lệnh rút này?')) return;
    setIsProcessingWithdraw(id);
    try {
      await adminApi.approveWithdraw(id);
      alert('Đã phê duyệt lệnh rút tiền thành công!');
      fetchWithdraws();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi phê duyệt lệnh rút');
    } finally {
      setIsProcessingWithdraw(null);
    }
  };

  const handleRejectWithdraw = async (id) => {
    const reason = window.prompt('Nhập lý do từ chối lệnh rút tiền (tiền sẽ hoàn về ví):', 'Thông tin ngân hàng không khớp');
    if (!reason) return;
    setIsProcessingWithdraw(id);
    try {
      await adminApi.rejectWithdraw(id, reason);
      alert('Đã từ chối lệnh rút và hoàn tiền về ví người dùng!');
      fetchWithdraws();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi từ chối lệnh rút');
    } finally {
      setIsProcessingWithdraw(null);
    }
  };

  const filteredAwaiting = awaitingBookings.filter((b) => {
    const q = paymentSearch.toLowerCase();
    return (
      b.bookingCode?.toLowerCase().includes(q) ||
      b.customerName?.toLowerCase().includes(q) ||
      b.service?.toLowerCase().includes(q)
    );
  });

  const filteredHistory = paymentHistory.filter((b) => {
    const q = paymentSearch.toLowerCase();
    return (
      b.bookingCode?.toLowerCase().includes(q) ||
      b.customerName?.toLowerCase().includes(q) ||
      b.service?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Sub-header navigation giữa Duyệt Thanh Toán và Lệnh Rút Tiền */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSection('PAYMENT')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSection === 'PAYMENT'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Duyệt thanh toán khách hàng ({awaitingBookings.length})
        </button>
        <button
          onClick={() => setActiveSection('WITHDRAW')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeSection === 'WITHDRAW'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Lệnh rút tiền ({withdraws.length})
        </button>
      </div>

      {activeSection === 'PAYMENT' ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaymentSubTab('AWAITING')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  paymentSubTab === 'AWAITING'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Chờ duyệt thanh toán ({awaitingBookings.length})
              </button>
              <button
                onClick={() => setPaymentSubTab('HISTORY')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  paymentSubTab === 'HISTORY'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Lịch sử đã duyệt ({paymentHistory.length})
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { fetchAwaitingPayments(); fetchPaymentHistory(); }}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                title="Làm mới"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm mã đơn, tên khách..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
                />
              </div>
            </div>
          </div>

          {paymentSubTab === 'AWAITING' ? (
            filteredAwaiting.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-60" />
                <p className="text-gray-500 font-medium">Hiện không có ca nào đang chờ duyệt thanh toán</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAwaiting.map((b) => (
                  <div key={b._id} className="border border-amber-200 bg-amber-50/20 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900 text-base">#{b.bookingCode}</span>
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                            Chờ đối soát thanh toán
                          </span>
                          <span className="text-xs text-gray-500">{b.date} • {b.time}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{b.service}</p>
                        <p className="text-xs text-gray-600">Khách hàng: <span className="font-semibold text-gray-800">{b.customerName}</span> ({b.customerPhone || 'Không có SĐT'})</p>
                        <p className="text-xs text-gray-600">Người thực hiện: <span className="font-semibold text-gray-800">{b.helper}</span> ({b.helperPhone || 'Chưa cập nhật'})</p>
                        <div className="pt-1 flex items-center gap-3">
                          <button
                            onClick={() => setActiveEvidenceModal(b)}
                            className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                          >
                            <Film className="w-3.5 h-3.5 text-indigo-600" />
                            Xem ảnh/video bằng chứng ({b.evidence?.length || 0})
                          </button>
                          <a
                            href={`https://img.vietqr.io/image/MB-0357790382-compact2.png?amount=${b.totalPrice}&addInfo=${encodeURIComponent(b.bookingCode)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                            Mã VietQR
                          </a>
                        </div>
                      </div>

                      <div className="flex lg:flex-col items-end justify-between lg:justify-center gap-3 border-t lg:border-t-0 pt-3 lg:pt-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Số tiền cần thanh toán</p>
                          <p className="text-2xl font-black text-emerald-600">{formatVND(b.totalPrice)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRejectPayment(b._id)}
                            disabled={isProcessingPayment === b._id}
                            className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" /> Từ chối
                          </button>
                          <button
                            onClick={() => handleConfirmPayment(b._id)}
                            disabled={isProcessingPayment === b._id}
                            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Xác nhận đã nhận tiền
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-y">
                  <tr>
                    <th className="py-3 px-4">Mã đơn</th>
                    <th className="py-3 px-4">Dịch vụ</th>
                    <th className="py-3 px-4">Khách hàng</th>
                    <th className="py-3 px-4">Người làm</th>
                    <th className="py-3 px-4">Tổng tiền</th>
                    <th className="py-3 px-4">Phí sàn</th>
                    <th className="py-3 px-4">Thu nhập thợ</th>
                    <th className="py-3 px-4 text-right">Bằng chứng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHistory.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50/80">
                      <td className="py-3 px-4 font-bold text-gray-900">#{b.bookingCode}</td>
                      <td className="py-3 px-4">{b.service}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{b.customerName}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{b.helper}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{formatVND(b.totalPrice)}</td>
                      <td className="py-3 px-4 text-gray-600">{formatVND(b.platformFee || b.pricingSnapshot?.platformFee || 0)}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{formatVND(b.helperEarnings || b.pricingSnapshot?.helperEarnings || 0)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setActiveEvidenceModal(b)}
                          className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium inline-flex items-center gap-1"
                        >
                          <Film className="w-3.5 h-3.5" /> Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Section Lệnh Rút Tiền */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Duyệt lệnh rút tiền về tài khoản ngân hàng</h3>
              <p className="text-sm text-gray-500">Kiểm tra thông tin tài khoản và đối soát các lệnh bất thường</p>
            </div>
            <button
              onClick={fetchWithdraws}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Làm mới
            </button>
          </div>

          {withdraws.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Hiện không có lệnh rút tiền nào đang chờ xử lý</p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdraws.map((w) => (
                <div
                  key={w._id}
                  className={`border rounded-xl p-5 hover:shadow-md transition-shadow ${
                    w.isFlagged ? 'border-rose-300 bg-rose-50/20' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 text-base">
                          {w.userId?.name || 'Người dùng'} ({w.userId?.phone || 'Chưa có SĐT'})
                        </span>
                        {w.isFlagged ? (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-xs font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Bất thường: {w.flagReason}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                            Hợp lệ
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{new Date(w.createdAt).toLocaleString('vi-VN')}</span>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1 text-gray-700 max-w-md">
                        <p><span className="font-semibold text-gray-900">Ngân hàng:</span> {w.bank?.bankName}</p>
                        <p><span className="font-semibold text-gray-900">Số tài khoản:</span> {w.bank?.accountNumber}</p>
                        <p><span className="font-semibold text-gray-900">Chủ tài khoản:</span> {w.bank?.accountName}</p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Số tiền rút</p>
                        <p className="text-2xl font-black text-rose-600">{formatVND(w.amount)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectWithdraw(w._id)}
                          disabled={isProcessingWithdraw === w._id}
                          className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Từ chối
                        </button>
                        <button
                          onClick={() => handleApproveWithdraw(w._id)}
                          disabled={isProcessingWithdraw === w._id}
                          className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Duyệt chuyển tiền
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Bằng chứng hoàn thành ca */}
      {activeEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Bằng chứng hoàn thành ca #{activeEvidenceModal.bookingCode}</h3>
                <p className="text-xs text-gray-500">{activeEvidenceModal.service} • {activeEvidenceModal.helper}</p>
              </div>
              <button onClick={() => setActiveEvidenceModal(null)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {(activeEvidenceModal.evidence || []).map((url, i) => {
                const isVideo = url.match(/\.(mp4|mov|webm)$/i) || url.includes('/video/upload/');
                return (
                  <div key={i} className="rounded-xl border overflow-hidden bg-black/5">
                    {isVideo ? (
                      <video src={url} controls className="w-full h-44 object-cover" />
                    ) : (
                      <img src={url} alt={`Evidence ${i}`} className="w-full h-44 object-cover cursor-pointer hover:opacity-90" onClick={() => window.open(url, '_blank')} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-right">
              <button onClick={() => setActiveEvidenceModal(null)} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-200">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsAndWithdrawsTab;

