import React, { useState, useEffect } from 'react';
import { Lock, Save, Camera, CheckCircle2, User, Phone, MapPin, Mail, Calendar, RefreshCw } from 'lucide-react';
import authApi from '../../../api/authApi';
import axiosClient from '../../../api/axiosClient';
import { useToast } from '../../../context/ToastContext';

const CustomerSettingsTab = ({ currentUser, onUserUpdated }) => {
  const { toast } = useToast();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [gender, setGender] = useState(currentUser?.gender || 'Khác');
  const [dob, setDob] = useState(currentUser?.dob || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
      setAvatar(currentUser.avatar || '');
      setGender(currentUser.gender || 'Khác');
      setDob(currentUser.dob || '');
    }
  }, [currentUser]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, JPEG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Dung lượng ảnh tối đa cho phép là 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'giupviec24/avatars');

    setIsUploadingAvatar(true);
    try {
      const res = await axiosClient.post('/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.url) {
        setAvatar(res.data.url);
        toast.success('Tải ảnh đại diện thành công! Nhấn "Lưu thông tin" để hoàn tất.');
      }
    } catch (err) {
      toast.error('Lỗi khi tải ảnh đại diện lên máy chủ');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.warning('Họ và tên không được để trống');
      return;
    }

    if (phone && !/^[0-9]{10,11}$/.test(phone.trim())) {
      toast.warning('Số điện thoại phải từ 10-11 chữ số hợp lệ');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await authApi.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        avatar,
        gender,
        dob,
      });

      toast.success(res.message || 'Cập nhật thông tin cá nhân thành công!');
      if (onUserUpdated && res.user) {
        onUserUpdated(res.user);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.warning('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.warning('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Hồ sơ cá nhân cơ bản */}
      <form onSubmit={handleSaveProfile} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Thông tin tài khoản khách hàng</h3>
            <p className="text-xs text-slate-500">Cập nhật hồ sơ để thuận tiện liên hệ và tự động điền địa chỉ khi đặt ca</p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Khách hàng
          </span>
        </div>

        {/* Avatar Section */}
        <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="relative group">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md group-hover:opacity-90 transition-opacity"
            />
            <label className="absolute -bottom-1 -right-1 p-2 bg-emerald-600 text-white rounded-xl cursor-pointer hover:bg-emerald-700 shadow-md transition-all">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-base">{name || 'Khách hàng'}</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser?.email}</span>
            </div>
            {isUploadingAvatar ? (
              <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Đang tải ảnh lên Cloud...
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ JPG, PNG (tối đa 5MB)</p>
            )}
          </div>
        </div>

        {/* Input fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Họ và tên</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Số điện thoại liên hệ</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0987 654 321"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Giới tính</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác / Không tiết lộ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Ngày sinh</span>
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Địa chỉ mặc định (Tự động điền khi tạo đơn mới)</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Căn hộ 1204, Vinhome D'Capitale, Trần Duy Hưng, Hà Nội"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </form>

      {/* Đổi mật khẩu */}
      <form onSubmit={handleChangePassword} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b pb-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-600" />
            Đổi mật khẩu tài khoản
          </h3>
          <p className="text-xs text-slate-500">Mật khẩu cần có tối thiểu 6 ký tự để bảo vệ an toàn tài khoản</p>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
          >
            {isChangingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerSettingsTab;
