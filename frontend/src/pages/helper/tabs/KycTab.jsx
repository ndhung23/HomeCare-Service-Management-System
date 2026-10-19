import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, Clock, Upload } from 'lucide-react';
import kycApi from '../../../api/kycApi';

const KycTab = ({ user, onKycUpdated }) => {
  const [kycData, setKycData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Form state
  const [fullName, setFullName] = useState(user?.name || '');
  const [idNumber, setIdNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Nữ');
  const [avatarFile, setAvatarFile] = useState(null);
  const [idFrontFile, setIdFrontFile] = useState(null);
  const [idBackFile, setIdBackFile] = useState(null);

  // Previews
  const [avatarPreview, setAvatarPreview] = useState('');
  const [idFrontPreview, setIdFrontPreview] = useState('');
  const [idBackPreview, setIdBackPreview] = useState('');

  const fetchKyc = async () => {
    setIsLoading(true);
    try {
      const data = await kycApi.getKycStatus();
      setKycData(data.kyc || {});
      if (data.kyc?.fullName) setFullName(data.kyc.fullName);
      if (data.kyc?.idNumber) setIdNumber(data.kyc.idNumber);
      if (data.kyc?.dob) setDob(data.kyc.dob);
      if (data.kyc?.gender) setGender(data.kyc.gender);
      if (data.kyc?.avatarUrl) setAvatarPreview(data.kyc.avatarUrl);
      if (data.kyc?.idFrontUrl) setIdFrontPreview(data.kyc.idFrontUrl);
      if (data.kyc?.idBackUrl) setIdBackPreview(data.kyc.idBackUrl);
    } catch (err) {
      console.error('Lỗi tải KYC:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKyc();
  }, []);

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File không được vượt quá 10MB!');
        return;
      }
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idNumber) {
      alert('Vui lòng nhập số CCCD/CMND!');
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('idNumber', idNumber);
      formData.append('dob', dob);
      formData.append('gender', gender);
      if (avatarFile) formData.append('avatar', avatarFile);
      if (idFrontFile) formData.append('idFront', idFrontFile);
      if (idBackFile) formData.append('idBack', idBackFile);

      const res = await kycApi.submitKyc(formData);
      setMessage({ type: 'success', text: res.message || 'Nộp hồ sơ thành công!' });
      await fetchKyc();
      if (onKycUpdated) onKycUpdated();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi nộp hồ sơ!';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const kycStatus = kycData?.status || 'NOT_SUBMITTED';

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
        Đang tải thông tin hồ sơ định danh KYC...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Trạng thái KYC */}
      <div className={`p-6 rounded-2xl border flex items-start gap-4 ${
        kycStatus === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
        kycStatus === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-900' :
        kycStatus === 'REJECTED' ? 'bg-rose-50 border-rose-200 text-rose-900' :
        'bg-blue-50 border-blue-200 text-blue-900'
      }`}>
        {kycStatus === 'APPROVED' && <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />}
        {kycStatus === 'PENDING' && <Clock className="w-8 h-8 text-amber-600 shrink-0" />}
        {kycStatus === 'REJECTED' && <AlertCircle className="w-8 h-8 text-rose-600 shrink-0" />}
        {kycStatus === 'NOT_SUBMITTED' && <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />}

        <div>
          <div className="font-extrabold text-base">
            {kycStatus === 'APPROVED' && 'Tài khoản Cấp 2 - Đã xác minh danh tính (Verified Pro)'}
            {kycStatus === 'PENDING' && 'Hồ sơ đang chờ Admin phê duyệt lên Cấp 2'}
            {kycStatus === 'REJECTED' && 'Hồ sơ KYC chưa được phê duyệt'}
            {kycStatus === 'NOT_SUBMITTED' && 'Tài khoản Cấp 1 (Chưa xác minh CCCD)'}
          </div>
          <p className="text-xs mt-1 leading-relaxed opacity-90">
            {kycStatus === 'APPROVED' && 'Bạn đã mở khóa toàn bộ quyền nhận ca từ Chợ việc làm và các đơn đặt đích danh.'}
            {kycStatus === 'PENDING' && 'Ban quản trị GiúpViệc24 đang đối chiếu ảnh chân dung và 2 mặt CCCD của bạn. Thời gian xử lý thông thường từ 1 - 2 giờ.'}
            {kycStatus === 'REJECTED' && `Lý do từ chối: "${kycData?.rejectReason || 'Ảnh mờ hoặc thông tin không khớp'}". Vui lòng cập nhật lại bên dưới.`}
            {kycStatus === 'NOT_SUBMITTED' && 'Để bảo đảm an toàn cho khách hàng và đủ điều kiện bấm Nhận ca từ Chợ việc làm, bạn cần tải lên ảnh CCCD 2 mặt để nâng hạng Cấp 2.'}
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold ${
          message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Form Nộp / Cập nhật KYC */}
      {kycStatus !== 'APPROVED' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <h3 className="text-base font-extrabold text-slate-900 border-b pb-3">
            Thông tin định danh cá nhân (KYC)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên đầy đủ <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                placeholder="Nguyễn Thị Lan"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số CCCD / CMND <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                placeholder="001234567890"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày tháng năm sinh</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none bg-white"
              >
                <option value="Nữ">Nữ</option>
                <option value="Nam">Nam</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          {/* 3 Upload boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* 1. Ảnh chân dung */}
            <div className="border border-slate-200 rounded-2xl p-4 text-center bg-slate-50/50">
              <div className="text-xs font-bold text-slate-700 mb-2">Ảnh chân dung (Avatar)</div>
              {avatarPreview ? (
                <div className="relative w-24 h-24 mx-auto rounded-xl overflow-hidden border">
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 mx-auto rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                  <Upload className="w-6 h-6" />
                </div>
              )}
              <label className="mt-3 inline-block cursor-pointer bg-white px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50">
                Chọn ảnh
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setAvatarFile, setAvatarPreview)} />
              </label>
            </div>

            {/* 2. Mặt trước CCCD */}
            <div className="border border-slate-200 rounded-2xl p-4 text-center bg-slate-50/50">
              <div className="text-xs font-bold text-slate-700 mb-2">Mặt trước CCCD <span className="text-red-500">*</span></div>
              {idFrontPreview ? (
                <div className="relative w-36 h-24 mx-auto rounded-xl overflow-hidden border">
                  <img src={idFrontPreview} alt="Front ID" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-36 h-24 mx-auto rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px]">
                  Chụp rõ nét mặt trước
                </div>
              )}
              <label className="mt-3 inline-block cursor-pointer bg-white px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50">
                Tải ảnh mặt trước
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setIdFrontFile, setIdFrontPreview)} />
              </label>
            </div>

            {/* 3. Mặt sau CCCD */}
            <div className="border border-slate-200 rounded-2xl p-4 text-center bg-slate-50/50">
              <div className="text-xs font-bold text-slate-700 mb-2">Mặt sau CCCD <span className="text-red-500">*</span></div>
              {idBackPreview ? (
                <div className="relative w-36 h-24 mx-auto rounded-xl overflow-hidden border">
                  <img src={idBackPreview} alt="Back ID" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-36 h-24 mx-auto rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px]">
                  Chụp rõ nét mặt sau
                </div>
              )}
              <label className="mt-3 inline-block cursor-pointer bg-white px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50">
                Tải ảnh mặt sau
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setIdBackFile, setIdBackPreview)} />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm flex items-center gap-2"
            >
              {isSubmitting ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ duyệt Cấp 2'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default KycTab;
