import React, { useState } from 'react';
import { Lock, Save, Camera, CheckCircle2 } from 'lucide-react';
import authApi from '../../../api/authApi';
import axiosClient from '../../../api/axiosClient';

const CustomerSettingsTab = ({ currentUser, onUserUpdated }) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        alert('Tải ảnh đại diện lên thành công! Hãy bấm Lưu thông tin để cập nhật.');
      }
    } catch (err) {
      alert('Lỗi tải ảnh đại diện lên Cloudinary');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await authApi.updateProfile({ name, phone, address, avatar });
      alert('Đã cập nhật hồ sơ cá nhân thành công!');
      if (onUserUpdated) onUserUpdated(res.user);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không trùng khớp!');
      return;
    }
    setIsChangingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      alert('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Hồ sơ cá nhân */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-gray-900 border-b pb-3">Thông tin tài khoản</h3>

        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={name}
              className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
            />
            <label className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full cursor-pointer hover:bg-emerald-700 shadow">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{name || 'Khách hàng'}</h4>
            <p className="text-xs text-gray-500">{currentUser?.email}</p>
            {isUploadingAvatar && <p className="text-xs text-emerald-600 font-semibold mt-1">Đang tải ảnh lên Cloud...</p>}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại liên hệ</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="0987654321"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ mặc định (Tự điền khi đặt lịch)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Số nhà, Đường, Phường, Quận, Thành phố..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSavingProfile}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm"
        >
          <Save className="w-4 h-4" /> Lưu thông tin cá nhân
        </button>
      </form>

      {/* Đổi mật khẩu */}
      <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" />
          Đổi mật khẩu
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu mới (tối thiểu 6 ký tự)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isChangingPassword}
          className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4" /> Đổi mật khẩu
        </button>
      </form>
    </div>
  );
};

export default CustomerSettingsTab;

