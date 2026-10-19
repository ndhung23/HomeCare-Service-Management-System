import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Eye, RefreshCw, X } from 'lucide-react';
import adminApi from '../../../api/adminApi';

const KycAndWorkersTab = ({ pendingKycList, fetchPendingKyc }) => {
  const [selectedKycUser, setSelectedKycUser] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = async (userId) => {
    if (!window.confirm('Xác nhận phê duyệt hồ sơ CCCD/Doanh nghiệp này lên Cấp 2?')) return;
    setIsProcessing(true);
    try {
      await adminApi.approveKyc(userId);
      alert('Đã phê duyệt KYC Cấp 2 thành công!');
      setSelectedKycUser(null);
      fetchPendingKyc();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi duyệt KYC');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert('Vui lòng nhập lý do từ chối hồ sơ');
      return;
    }
    setIsProcessing(true);
    try {
      await adminApi.rejectKyc(selectedKycUser._id, rejectReason);
      alert('Đã từ chối hồ sơ KYC và gửi lý do cho người dùng.');
      setShowRejectModal(false);
      setSelectedKycUser(null);
      setRejectReason('');
      fetchPendingKyc();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi từ chối KYC');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Phê duyệt hồ sơ định danh KYC Cấp 2</h3>
          <p className="text-sm text-gray-500">Đối chiếu ảnh chân dung, CCCD và Giấy phép kinh doanh để cấp quyền nhận việc</p>
        </div>
        <button
          onClick={fetchPendingKyc}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 flex items-center gap-2 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {pendingKycList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Hiện không có hồ sơ KYC nào đang chờ duyệt</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingKycList.map((user) => (
            <div key={user._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={user.kyc?.avatarUrl || user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{user.kyc?.fullName || user.name}</h4>
                  <p className="text-xs text-gray-500">{user.role === 'enterprise' ? 'Doanh nghiệp' : 'Người giúp việc'}</p>
                  <p className="text-xs text-gray-500">{user.phone} • {user.email}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1 text-gray-600">
                <p><span className="font-semibold text-gray-700">Số định danh / MST:</span> {user.kyc?.idNumber || user.kyc?.taxCode || 'Chưa cung cấp'}</p>
                <p><span className="font-semibold text-gray-700">Ngày sinh:</span> {user.kyc?.dob || 'Không rõ'}</p>
                <p><span className="font-semibold text-gray-700">Thời gian nộp:</span> {user.kyc?.submittedAt ? new Date(user.kyc.submittedAt).toLocaleString('vi-VN') : 'Mới đây'}</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedKycUser(user)}
                  className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Xem ảnh đối chiếu
                </button>
                <button
                  onClick={() => handleApprove(user._id)}
                  disabled={isProcessing}
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Chi tiết ảnh bằng chứng KYC */}
      {selectedKycUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chi tiết hồ sơ KYC: {selectedKycUser.name}</h3>
                <p className="text-xs text-gray-500">Đối chiếu thông tin và ảnh giấy tờ thực tế</p>
              </div>
              <button onClick={() => setSelectedKycUser(null)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedKycUser.kyc?.avatarUrl && (
                <div className="border rounded-xl p-2 text-center space-y-1">
                  <p className="text-xs font-semibold text-gray-700">Ảnh chân dung</p>
                  <img
                    src={selectedKycUser.kyc.avatarUrl}
                    alt="Avatar"
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 border"
                    onClick={() => setPreviewImage(selectedKycUser.kyc.avatarUrl)}
                  />
                </div>
              )}
              {selectedKycUser.kyc?.idFrontUrl && (
                <div className="border rounded-xl p-2 text-center space-y-1">
                  <p className="text-xs font-semibold text-gray-700">CCCD Mặt trước</p>
                  <img
                    src={selectedKycUser.kyc.idFrontUrl}
                    alt="Front"
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 border"
                    onClick={() => setPreviewImage(selectedKycUser.kyc.idFrontUrl)}
                  />
                </div>
              )}
              {selectedKycUser.kyc?.idBackUrl && (
                <div className="border rounded-xl p-2 text-center space-y-1">
                  <p className="text-xs font-semibold text-gray-700">CCCD Mặt sau</p>
                  <img
                    src={selectedKycUser.kyc.idBackUrl}
                    alt="Back"
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 border"
                    onClick={() => setPreviewImage(selectedKycUser.kyc.idBackUrl)}
                  />
                </div>
              )}
              {selectedKycUser.kyc?.businessLicenseUrl && (
                <div className="border rounded-xl p-2 text-center space-y-1 col-span-2 sm:col-span-1">
                  <p className="text-xs font-semibold text-gray-700">Giấy phép KD</p>
                  <img
                    src={selectedKycUser.kyc.businessLicenseUrl}
                    alt="License"
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 border"
                    onClick={() => setPreviewImage(selectedKycUser.kyc.businessLicenseUrl)}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-sm font-semibold flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Từ chối hồ sơ
              </button>
              <button
                onClick={() => handleApprove(selectedKycUser._id)}
                disabled={isProcessing}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Phê duyệt Cấp 2
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal từ chối nhập lý do */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">Từ chối hồ sơ KYC</h3>
            <textarea
              placeholder="Nhập lý do từ chối (ví dụ: Ảnh CCCD bị mờ, không nhìn rõ số CMND)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium">Hủy</button>
              <button onClick={handleReject} disabled={isProcessing} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold">Xác nhận từ chối</button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default KycAndWorkersTab;

