import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  MapPin,
  Camera,
  Save,
  Clock,
  Building2,
  XCircle,
  FileText,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import authApi from '../../../api/authApi';
import axiosClient from '../../../api/axiosClient';
import { formatVND } from '../../../utils/serviceUtils';
import { useToast } from '../../../context/ToastContext';

const ProfileSettingsTab = ({ user, onUserUpdated }) => {
  const { toast, confirm } = useToast();
  const isEnterprise = user?.role === 'enterprise';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [hourlyRate, setHourlyRate] = useState(120000);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const pending = user?.pendingProfileUpdate;
  const isPendingReview = pending?.status === 'PENDING';
  const isRejected = pending?.status === 'REJECTED';

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setAvatar(user.avatar || '');
      setBio(user.bio || '');
      setExperience(user.experience || '');
      setHourlyRate(user.hourlyRate || 120000);
      setSkills(Array.isArray(user.skills) && user.skills.length > 0 ? user.skills : ['Dọn dẹp', 'Nấu ăn']);
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Vui lòng chọn file hình ảnh (PNG, JPG, JPEG)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', isEnterprise ? 'giupviec24/enterprise' : 'giupviec24/helpers');

    setIsUploadingAvatar(true);
    try {
      const res = await axiosClient.post('/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.url) {
        setAvatar(res.data.url);
        toast.success('Đã tải ảnh lên! Hãy bấm gửi yêu cầu để Admin xác thực.');
      }
    } catch (err) {
      toast.error('Lỗi tải ảnh lên hệ thống');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.warning(isEnterprise ? 'Tên doanh nghiệp không được để trống' : 'Họ và tên không được để trống');
      return;
    }

    if (phone && !/^[0-9]{10,11}$/.test(phone.trim())) {
      toast.warning('Số điện thoại liên hệ phải từ 10-11 chữ số hợp lệ');
      return;
    }

    const ok = await confirm({
      title: 'Xác nhận gửi yêu cầu cập nhật hồ sơ',
      message: isEnterprise
        ? 'Theo quy chế sàn B2B, thông tin Doanh nghiệp cần được Ban Quản Trị xác thực trước khi cập nhật chính thức trên hợp đồng dịch vụ. Bạn có chắc chắn muốn gửi yêu cầu này?'
        : 'Theo quy chế sàn, thông tin Người giúp việc hiển thị công khai cho khách hàng nên cần Admin xác thực trước khi cập nhật chính thức. Bạn có chắc chắn muốn gửi yêu cầu này?',
      confirmText: 'Gửi yêu cầu tới Admin',
      cancelText: 'Kiểm tra lại',
      type: 'warning',
    });

    if (!ok) return;

    setIsSubmitting(true);
    try {
      const res = await authApi.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        avatar,
        bio: bio.trim(),
        experience: experience.trim(),
        hourlyRate: Number(hourlyRate) || 120000,
        skills,
      });

      toast.success(res.message || 'Yêu cầu cập nhật hồ sơ đã được gửi tới Ban quản trị thành công!');
      if (onUserUpdated && res.user) {
        onUserUpdated(res.user);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi khi gửi yêu cầu cập nhật hồ sơ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPending = async () => {
    const ok = await confirm({
      title: 'Hủy yêu cầu cập nhật hồ sơ?',
      message: 'Bạn có chắc chắn muốn rút lại yêu cầu thay đổi thông tin đang chờ Admin duyệt không?',
      confirmText: 'Đồng ý hủy',
      cancelText: 'Giữ lại',
      type: 'danger',
    });

    if (!ok) return;

    setIsCancelling(true);
    try {
      const res = await authApi.cancelPendingProfileUpdate();
      toast.success('Đã hủy yêu cầu cập nhật hồ sơ.');
      if (onUserUpdated && res.user) {
        onUserUpdated(res.user);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi hủy yêu cầu');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Banner quy định kiểm duyệt của Admin */}
      <div className={`${isEnterprise ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'} border rounded-3xl p-5 flex items-start gap-4 shadow-xs`}>
        <div className={`p-2.5 ${isEnterprise ? 'bg-amber-600' : 'bg-blue-600'} text-white rounded-2xl shrink-0`}>
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className={`text-sm font-black ${isEnterprise ? 'text-amber-950' : 'text-blue-900'}`}>
            Quy định xác thực hồ sơ {isEnterprise ? 'Doanh nghiệp Đối tác' : 'Người giúp việc'}
          </h4>
          <p className={`text-xs ${isEnterprise ? 'text-amber-800/90' : 'text-blue-800/90'} mt-1 leading-relaxed`}>
            {isEnterprise
              ? 'Doanh nghiệp là đối tác pháp nhân cung ứng nhân sự B2B cho sàn. Nhằm đảm bảo tính chính xác và pháp lý hợp đồng, mọi thay đổi tên doanh nghiệp, hotline, địa chỉ trụ sở đều phải được Admin xác thực trước khi cập nhật.'
              : 'Người giúp việc là đối tác cung cấp dịch vụ trực tiếp tại nhà khách hàng. Nhằm đảm bảo an toàn và tính chính xác, mọi thay đổi thông tin hồ sơ (họ tên, số điện thoại, kinh nghiệm, ảnh đại diện) bắt buộc phải được Ban Quản Trị (Admin) xác thực.'}
          </p>
        </div>
      </div>

      {/* Thông báo trạng thái đang chờ duyệt (PENDING) */}
      {isPendingReview && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 shadow-md space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-950 flex items-center gap-2">
                  <span>Yêu cầu sửa hồ sơ đang chờ Admin phê duyệt</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                </h4>
                <p className="text-xs text-amber-800">
                  Gửi lúc: {pending?.requestedAt ? new Date(pending.requestedAt).toLocaleString('vi-VN') : 'Mới đây'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancelPending}
              disabled={isCancelling}
              className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
            >
              {isCancelling ? 'Đang hủy...' : 'Hủy yêu cầu này'}
            </button>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 border border-amber-200 text-xs text-slate-700 space-y-2">
            <div className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
              Dữ liệu mới đang đề xuất cập nhật:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>• <strong>{isEnterprise ? 'Tên DN mới:' : 'Họ tên mới:'}</strong> {pending?.data?.name || '(Không đổi)'}</div>
              <div>• <strong>{isEnterprise ? 'Hotline mới:' : 'SĐT mới:'}</strong> {pending?.data?.phone || '(Không đổi)'}</div>
              <div>• <strong>{isEnterprise ? 'Trụ sở mới:' : 'Địa chỉ mới:'}</strong> {pending?.data?.address || '(Không đổi)'}</div>
              {!isEnterprise && (
                <div>• <strong>Giá theo giờ:</strong> {pending?.data?.hourlyRate ? formatVND(pending.data.hourlyRate) : '(Không đổi)'}</div>
              )}
            </div>
            {pending?.data?.bio && (
              <div className="pt-1 text-[11px] text-slate-600 italic">
                • <strong>{isEnterprise ? 'Hồ sơ năng lực:' : 'Giới thiệu:'}</strong> "{pending.data.bio}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thông báo nếu yêu cầu trước đó bị từ chối */}
      {isRejected && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 flex items-start gap-3 text-xs text-rose-800">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold text-rose-900 text-sm">Yêu cầu sửa hồ sơ trước đó đã bị Ban Quản Trị từ chối</h5>
            <p className="text-rose-700">
              <strong>Lý do từ chối:</strong> {pending?.rejectReason || 'Thông tin chưa đạt chuẩn xác minh của hệ thống.'}
            </p>
            <p className="text-[11px] text-rose-600">Vui lòng điều chỉnh thông tin chính xác và gửi lại yêu cầu bên dưới.</p>
          </div>
        </div>
      )}

      {/* Form Cập nhật hồ sơ */}
      <form onSubmit={handleSubmitProfile} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Thông tin hồ sơ {isEnterprise ? 'Doanh nghiệp B2B' : 'Cộng tác viên'}
            </h3>
            <p className="text-xs text-slate-500">
              Thông tin này sẽ được hiển thị công khai trên hệ thống GiúpViệc24 sau khi Admin xác thực
            </p>
          </div>
          <span className={`text-[11px] font-bold ${isEnterprise ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-blue-700 bg-blue-50 border-blue-200'} px-3 py-1 rounded-full border flex items-center gap-1`}>
            <ShieldCheck className="w-3.5 h-3.5" /> {isEnterprise ? 'Đối tác B2B' : 'Cộng tác viên Pro'}
          </span>
        </div>

        {/* Avatar / Logo Upload */}
        <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="relative group">
            <img
              src={avatar || (isEnterprise ? 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80' : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80')}
              alt={name}
              className={`w-20 h-20 rounded-2xl object-cover border-2 ${isEnterprise ? 'border-amber-500' : 'border-blue-500'} shadow-md group-hover:opacity-90 transition-opacity`}
            />
            <label className={`absolute -bottom-1 -right-1 p-2 ${isEnterprise ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl cursor-pointer shadow-md transition-all`}>
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-base">{name || (isEnterprise ? 'Doanh nghiệp' : 'Người giúp việc')}</h4>
            <p className="text-xs text-slate-500">{user?.email}</p>
            {isUploadingAvatar ? (
              <p className={`text-xs ${isEnterprise ? 'text-amber-600' : 'text-blue-600'} font-bold mt-1.5 flex items-center gap-1`}>
                <RefreshCw className="w-3 h-3 animate-spin" /> Đang tải {isEnterprise ? 'Logo' : 'ảnh'} lên...
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                {isEnterprise ? 'Logo thương hiệu công ty (PNG, JPG)' : 'Nên sử dụng ảnh chân dung rõ mặt, lịch sự'}
              </p>
            )}
          </div>
        </div>

        {/* Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              {isEnterprise ? <Building2 className="w-3.5 h-3.5 text-slate-400" /> : <User className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isEnterprise ? 'Tên Doanh nghiệp / Công ty' : 'Họ và tên hiển thị'}</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isEnterprise ? 'Công ty TNHH Dịch vụ CleanPro' : 'Nguyễn Thị Lan'}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEnterprise ? 'Hotline liên hệ B2B' : 'Số điện thoại liên hệ'}</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0987654321"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              required
            />
          </div>

          {!isEnterprise && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Mức thù lao mong muốn (VNĐ/giờ)</span>
              </label>
              <input
                type="number"
                min={60000}
                step={10000}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          )}

          {!isEnterprise && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Kinh nghiệm làm việc</span>
              </label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Ví dụ: 3 năm dọn dẹp chung cư, nấu ăn gia đình"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{isEnterprise ? 'Địa chỉ văn phòng / Trụ sở chính' : 'Khu vực sinh sống & hoạt động chính'}</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={isEnterprise ? 'Tầng 5, Tòa nhà Keangnam, Mễ Trì, Nam Từ Liêm, Hà Nội' : 'Quận Cầu Giấy / Đống Đa, Hà Nội'}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        {/* Skills Tag input for Helper */}
        {!isEnterprise && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kỹ năng dịch vụ chuyên môn
            </label>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 text-blue-400 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Thêm kỹ năng (ví dụ: Chăm trẻ, Giặt là, Nấu cỗ...)"
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                + Thêm
              </button>
            </div>
          </div>
        )}

        {/* Bio / Năng lực */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {isEnterprise ? 'Hồ sơ năng lực & Giới thiệu doanh nghiệp' : 'Giới thiệu bản thân tới khách hàng'}
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={
              isEnterprise
                ? 'Giới thiệu về quy mô nhân sự, quy trình đào tạo nghiệp vụ và cam kết chất lượng của công ty...'
                : 'Nêu tính cách cẩn thận, trung thực, kinh nghiệm và mong muốn làm việc lâu dài...'
            }
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 italic">
            * Sau khi gửi, thông tin sẽ được Admin kiểm duyệt trong vòng 24h.
          </p>

          <button
            type="submit"
            disabled={isSubmitting || isPendingReview}
            className={`px-6 py-2.5 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition-all ${
              isPendingReview
                ? 'bg-slate-400 cursor-not-allowed opacity-60'
                : isEnterprise
                ? 'bg-amber-600 hover:bg-amber-700 cursor-pointer'
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>
              {isSubmitting ? 'Đang gửi yêu cầu...' : isPendingReview ? 'Đang chờ Admin duyệt' : 'Gửi yêu cầu xác thực'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettingsTab;
