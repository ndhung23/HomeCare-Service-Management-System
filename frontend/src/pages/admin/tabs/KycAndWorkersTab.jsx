import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  X,
  Clock,
  FileEdit
} from 'lucide-react';
import adminApi from '../../../api/adminApi';
import { formatVND } from '../../../utils/serviceUtils';
import { useToast } from '../../../context/ToastContext';

const KycAndWorkersTab = ({ pendingKycList, fetchPendingKyc }) => {
  const { toast, confirm, prompt } = useToast();

  const [activeSubTab, setActiveSubTab] = useState('KYC'); // 'KYC' | 'PROFILE_UPDATES'

  // KYC State
  const [selectedKycUser, setSelectedKycUser] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isProcessingKyc, setIsProcessingKyc] = useState(false);
  const [showRejectKycModal, setShowRejectKycModal] = useState(false);
  const [rejectKycReason, setRejectKycReason] = useState('');

  // Profile Updates State
  const [pendingProfileUpdates, setPendingProfileUpdates] = useState([]);

  const fetchProfileUpdates = useCallback(async () => {
    try {
      const data = await adminApi.getPendingProfileUpdates();
      setPendingProfileUpdates(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách sửa hồ sơ:', err);
    }
  }, []);

  useEffect(() => {
    fetchProfileUpdates();
  }, [fetchProfileUpdates]);

  // Handle KYC Actions
  const handleApproveKyc = async (userId) => {
    const ok = await confirm({
      title: 'Phê duyệt KYC Cấp 2',
      message: 'Xác nhận cấp chứng nhận định danh Cấp 2 cho tài khoản này?',
      confirmText: 'Phê duyệt',
      type: 'info',
    });
    if (!ok) return;

    setIsProcessingKyc(true);
    try {
      await adminApi.approveKyc(userId);
      toast.success('Đã phê duyệt KYC Cấp 2 thành công!');
      setSelectedKycUser(null);
      fetchPendingKyc();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi duyệt KYC');
    } finally {
      setIsProcessingKyc(false);
    }
  };

  const handleRejectKyc = async () => {
    if (!rejectKycReason.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối hồ sơ');
      return;
    }
    setIsProcessingKyc(true);
    try {
      await adminApi.rejectKyc(selectedKycUser._id, rejectKycReason.trim());
      toast.success('Đã từ chối hồ sơ KYC và gửi thông báo cho đối tác.');
      setShowRejectKycModal(false);
      setSelectedKycUser(null);
      setRejectKycReason('');
      fetchPendingKyc();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi từ chối KYC');
    } finally {
      setIsProcessingKyc(false);
    }
  };

  // Handle Profile Update Actions
  const handleApproveProfileUpdate = async (user) => {
    const ok = await confirm({
      title: 'Xác thực cập nhật hồ sơ',
      message: `Bạn có chắc chắn muốn phê duyệt các thay đổi thông tin mới của "${user.name}"? Dữ liệu mới sẽ được áp dụng chính thức lên hệ thống.`,
      confirmText: 'Phê duyệt & Áp dụng',
      type: 'info',
    });
    if (!ok) return;

    try {
      await adminApi.approveProfileUpdate(user._id);
      toast.success(`Đã cập nhật hồ sơ thành công cho ${user.name}!`);
      fetchProfileUpdates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi phê duyệt hồ sơ');
    }
  };

  const handleRejectProfileUpdate = async (user) => {
    const reason = await prompt({
      title: 'Từ chối cập nhật hồ sơ',
      message: `Nhập lý do từ chối yêu cầu thay đổi thông tin của "${user.name}":`,
      defaultValue: 'Thông tin chưa đạt yêu cầu xác minh của Ban Quản Trị',
      confirmText: 'Xác nhận từ chối',
    });

    if (reason === null) return;
    if (!reason.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await adminApi.rejectProfileUpdate(user._id, reason.trim());
      toast.success('Đã từ chối yêu cầu cập nhật hồ sơ và gửi lý do cho đối tác.');
      fetchProfileUpdates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi từ chối hồ sơ');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-lg font-black text-slate-900">Xác thực & Kiểm duyệt Đối tác</h3>
          <p className="text-xs text-slate-500">Phê duyệt hồ sơ KYC Cấp 2 và xác minh các yêu cầu thay đổi thông tin của Người giúp việc & Doanh nghiệp</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab pills */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('KYC')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSubTab === 'KYC'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Định danh CCCD (KYC)</span>
              {pendingKycList.length > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {pendingKycList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('PROFILE_UPDATES')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSubTab === 'PROFILE_UPDATES'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Yêu cầu sửa hồ sơ</span>
              {pendingProfileUpdates.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingProfileUpdates.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => {
              fetchPendingKyc();
              fetchProfileUpdates();
            }}
            title="Làm mới"
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SUB-TAB 1: PHÊ DUYỆT KYC CCCD CẤP 2 */}
      {/* ==================================================== */}
      {activeSubTab === 'KYC' && (
        <>
          {pendingKycList.length === 0 ? (
            <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-bold text-sm">Hiện không có hồ sơ KYC nào đang chờ duyệt</p>
              <p className="text-xs text-slate-400 mt-1">Khi đối tác nộp ảnh CCCD/Giấy phép, hồ sơ sẽ hiển thị tại đây.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingKycList.map((user) => (
                <div key={user._id} className="border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow space-y-3 bg-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.kyc?.avatarUrl || user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={user.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{user.kyc?.fullName || user.name}</h4>
                      <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full mt-0.5 ${
                        user.role === 'enterprise' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {user.role === 'enterprise' ? 'Doanh nghiệp B2B' : 'Người giúp việc'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-100">
                    <p><span className="font-semibold text-slate-700">Số định danh / MST:</span> {user.kyc?.idNumber || user.kyc?.taxCode || 'Chưa cung cấp'}</p>
                    <p><span className="font-semibold text-slate-700">Ngày sinh:</span> {user.kyc?.dob || 'Không rõ'}</p>
                    <p><span className="font-semibold text-slate-700">Thời gian nộp:</span> {user.kyc?.submittedAt ? new Date(user.kyc.submittedAt).toLocaleString('vi-VN') : 'Mới đây'}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedKycUser(user)}
                      className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem ảnh đối chiếu
                    </button>
                    <button
                      onClick={() => handleApproveKyc(user._id)}
                      disabled={isProcessingKyc}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 2: PHÊ DUYỆT SỬA HỒ SƠ (HELPER & DOANH NGHIỆP) */}
      {/* ==================================================== */}
      {activeSubTab === 'PROFILE_UPDATES' && (
        <>
          {pendingProfileUpdates.length === 0 ? (
            <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileEdit className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-bold text-sm">Không có yêu cầu cập nhật hồ sơ nào đang chờ duyệt</p>
              <p className="text-xs text-slate-400 mt-1">Khi người giúp việc hoặc doanh nghiệp sửa thông tin, yêu cầu sẽ xuất hiện tại đây để Admin thẩm định.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProfileUpdates.map((user) => {
                const pendingData = user.pendingProfileUpdate?.data || {};
                const isEnt = user.role === 'enterprise';

                return (
                  <div
                    key={user._id}
                    className="border-2 border-amber-200 bg-amber-50/20 rounded-2xl p-5 hover:shadow-md transition-shadow space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={user.name}
                          className="w-12 h-12 rounded-xl object-cover border border-amber-300"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 text-sm">{user.name}</h4>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              isEnt ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {isEnt ? 'Doanh nghiệp B2B' : 'Người giúp việc'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            <span>{user.email}</span> • <span>SĐT hiện tại: {user.phone || 'Chưa có'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Gửi lúc: {user.pendingProfileUpdate?.requestedAt ? new Date(user.pendingProfileUpdate.requestedAt).toLocaleString('vi-VN') : 'Mới đây'}</span>
                      </div>
                    </div>

                    {/* So sánh Đối chiếu (Visual Diff) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Cột 1: Thông tin hiện tại */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                        <div className="font-black text-slate-400 uppercase tracking-wider text-[10px] pb-1 border-b">
                          Thông tin hiện tại trên hệ thống
                        </div>
                        <div className="space-y-1 text-slate-600">
                          <p>• <strong>Họ tên / DN:</strong> {user.name}</p>
                          <p>• <strong>SĐT:</strong> {user.phone || '(Trống)'}</p>
                          <p>• <strong>Địa chỉ:</strong> {user.address || '(Trống)'}</p>
                          {!isEnt && <p>• <strong>Giá theo giờ:</strong> {formatVND(user.hourlyRate || 120000)}</p>}
                          {!isEnt && <p>• <strong>Kinh nghiệm:</strong> {user.experience || '(Trống)'}</p>}
                          <p>• <strong>Giới thiệu:</strong> {user.bio ? `"${user.bio}"` : '(Trống)'}</p>
                        </div>
                      </div>

                      {/* Cột 2: Thông tin mới muốn cập nhật */}
                      <div className="p-4 bg-emerald-50/60 rounded-xl border-2 border-emerald-300 space-y-2">
                        <div className="font-black text-emerald-800 uppercase tracking-wider text-[10px] pb-1 border-b border-emerald-200 flex items-center justify-between">
                          <span>Thông tin mới đề xuất thay đổi</span>
                          <span className="bg-emerald-600 text-white px-2 py-0.2 rounded-full font-bold">Mới</span>
                        </div>
                        <div className="space-y-1 text-slate-800">
                          <p>• <strong>Họ tên / DN mới:</strong> <span className="font-black text-emerald-800">{pendingData.name || user.name}</span></p>
                          <p>• <strong>SĐT mới:</strong> <span className="font-black text-emerald-800">{pendingData.phone || user.phone}</span></p>
                          <p>• <strong>Địa chỉ mới:</strong> <span className="font-black text-emerald-800">{pendingData.address || user.address}</span></p>
                          {!isEnt && pendingData.hourlyRate && (
                            <p>• <strong>Giá theo giờ mới:</strong> <span className="font-black text-emerald-800">{formatVND(pendingData.hourlyRate)}</span></p>
                          )}
                          {!isEnt && pendingData.experience && (
                            <p>• <strong>Kinh nghiệm mới:</strong> <span className="font-black text-emerald-800">{pendingData.experience}</span></p>
                          )}
                          {pendingData.bio && (
                            <p>• <strong>Giới thiệu mới:</strong> <span className="font-medium text-slate-700 italic">"{pendingData.bio}"</span></p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Nút hành động của Admin */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleRejectProfileUpdate(user)}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Từ chối thay đổi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApproveProfileUpdate(user)}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Phê duyệt & Áp dụng ngay</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal Chi tiết ảnh bằng chứng KYC */}
      {selectedKycUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Chi tiết hồ sơ KYC: {selectedKycUser.name}</h3>
                <p className="text-xs text-slate-500">Đối chiếu thông tin và ảnh giấy tờ thực tế</p>
              </div>
              <button onClick={() => setSelectedKycUser(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1">Mặt trước CCCD / Giấy phép</p>
                <div
                  className="h-44 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer relative group flex items-center justify-center"
                  onClick={() => setPreviewImage(selectedKycUser.kyc?.idFrontUrl)}
                >
                  {selectedKycUser.kyc?.idFrontUrl ? (
                    <img src={selectedKycUser.kyc.idFrontUrl} alt="CCCD Trước" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-400">Không có ảnh mặt trước</span>
                  )}
                  <span className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                    <Eye className="w-4 h-4 mr-1" /> Xem phóng to
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 mb-1">Mặt sau CCCD</p>
                <div
                  className="h-44 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer relative group flex items-center justify-center"
                  onClick={() => setPreviewImage(selectedKycUser.kyc?.idBackUrl)}
                >
                  {selectedKycUser.kyc?.idBackUrl ? (
                    <img src={selectedKycUser.kyc.idBackUrl} alt="CCCD Sau" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-400">Không có ảnh mặt sau</span>
                  )}
                  <span className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                    <Eye className="w-4 h-4 mr-1" /> Xem phóng to
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowRejectKycModal(true)}
                disabled={isProcessingKyc}
                className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl"
              >
                Từ chối hồ sơ
              </button>
              <button
                onClick={() => handleApproveKyc(selectedKycUser._id)}
                disabled={isProcessingKyc}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Phê duyệt KYC Cấp 2
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal phóng to ảnh */}
      {previewImage && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={previewImage} alt="Phóng to" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
            <button className="absolute -top-10 right-0 text-white hover:text-slate-300">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Modal nhập lý do từ chối KYC */}
      {showRejectKycModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h4 className="font-black text-slate-900 text-base">Từ chối hồ sơ định danh KYC</h4>
            <p className="text-xs text-slate-500">Nêu rõ lý do để người dùng nắm được và nộp lại ảnh giấy tờ chính xác:</p>
            <textarea
              rows={3}
              value={rejectKycReason}
              onChange={(e) => setRejectKycReason(e.target.value)}
              placeholder="Ví dụ: Ảnh chụp CCCD bị lóa sáng / mờ góc / thông tin họ tên không trùng khớp..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
            />
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowRejectKycModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectKyc}
                disabled={isProcessingKyc}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycAndWorkersTab;
