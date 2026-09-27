import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  User,
  ArrowRight
} from 'lucide-react';

const BookingModal = ({ isOpen, onClose, initialData = {} }) => {
  const { user, addBooking } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(initialData.service || 'Dọn dẹp nhà theo giờ');
  const [helperName, setHelperName] = useState(initialData.helperName || 'Người giúp việc phù hợp nhất');
  const [ratePerHour, setRatePerHour] = useState(initialData.hourlyRate || 120000);
  const [hours, setHours] = useState(3);
  const [date, setDate] = useState('2026-09-28');
  const [time, setTime] = useState('14:00');
  const [address, setAddress] = useState(initialData.address || 'Căn hộ 1204, Vinhomes D’Capitale, Trần Duy Hưng, Hà Nội');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  useEffect(() => {
    if (initialData.service) setService(initialData.service);
    if (initialData.helperName) setHelperName(initialData.helperName);
    if (initialData.hourlyRate) setRatePerHour(initialData.hourlyRate);
    if (initialData.address) setAddress(initialData.address);
  }, [initialData]);

  if (!isOpen) return null;

  const totalPrice = hours * ratePerHour;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập tài khoản Khách hàng để đặt dịch vụ!');
      navigate('/login');
      return;
    }

    const newBooking = addBooking({
      service,
      helper: helperName,
      date: date.split('-').reverse().join('/'),
      time: `${time} (${hours} tiếng)`,
      address,
      price: `${totalPrice.toLocaleString('vi-VN')}đ`,
      note,
    });

    setCreatedBooking(newBooking);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {isSuccess ? 'Đặt lịch thành công!' : 'Đặt người giúp việc'}
              </h3>
              <p className="text-[11px] text-slate-400">Dịch vụ uy tín • Cam kết chất lượng</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-1">
              Đã nhận yêu cầu đặt lịch!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
              Mã đơn: <strong className="text-blue-600 font-bold">{createdBooking?.id}</strong>. Người giúp việc sẽ xác nhận và liên hệ với bạn trong ít phút.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs space-y-2 border border-slate-100 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Dịch vụ:</span>
                <span className="font-bold text-slate-800">{createdBooking?.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Người thực hiện:</span>
                <span className="font-bold text-slate-800">{createdBooking?.helper}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian:</span>
                <span className="font-bold text-slate-800">{createdBooking?.date} lúc {createdBooking?.time}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2 font-bold text-sm">
                <span className="text-slate-600">Tổng tiền dự kiến:</span>
                <span className="text-blue-600">{createdBooking?.price}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleClose}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Tiếp tục ở Trang chủ
              </button>
              <button
                onClick={() => {
                  handleClose();
                  navigate('/customer');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Xem lịch sử đơn (/customer)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Service & Helper Info Card */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center font-bold shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{helperName}</div>
                  <div className="text-[11px] text-blue-700 font-semibold">{service}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900">
                  {ratePerHour.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-[10px] text-slate-500"> / giờ</span>
              </div>
            </div>

            {/* Select Hours */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Thời lượng ca làm việc
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 6].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(h)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      hours === h 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {h} tiếng
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ngày làm việc
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giờ bắt đầu
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Địa chỉ làm việc
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập số nhà, tên đường, quận/huyện..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi chú cho người giúp việc (tùy chọn)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Nhà có thú cưng, cần mang dụng cụ dọn dẹp..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            {/* Total calculation & trust note */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Tổng thanh toán:</span>
                <div className="text-xl font-black text-blue-600">
                  {totalPrice.toLocaleString('vi-VN')}đ
                </div>
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bảo hiểm trách nhiệm 100%</span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Xác nhận đặt lịch ngay</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default BookingModal;
