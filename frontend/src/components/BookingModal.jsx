import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowRight,
  ChevronDown,
  Info,
  Check,
  Users
} from 'lucide-react';
import {
  resolveService,
  buildDefaultDynamicAttributes,
  computePricing,
  formatVND,
  summarizeDynamicAttributes,
  PRICING_TYPES,
} from '../utils/serviceUtils';
import serviceApi from '../api/serviceApi';
import workerApi from '../api/workerApi';

const BookingModal = ({ isOpen, onClose, initialData = {} }) => {
  const { user, addBooking } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      Promise.all([serviceApi.getServices(), workerApi.getWorkers()])
        .then(([servicesData, workersData]) => {
          setServices(servicesData);
          setWorkers(workersData);
        })
        .catch((err) => console.error('Lỗi khi tải dữ liệu modal từ MongoDB:', err));
    }
  }, [isOpen]);

  // Xác định dịch vụ hiện tại dựa trên initialData và danh sách services
  const activeService = useMemo(() => resolveService(initialData, services), [initialData, services]);

  // Helper tạo ngày mai mặc định
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // Các state form cơ bản
  const [workerOption, setWorkerOption] = useState('MARKET'); // 'MARKET' | 'AUTO' | 'SPECIFIC'
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [durationHours, setDurationHours] = useState(3);
  const [workDate, setWorkDate] = useState(getTomorrow());
  const [startTime, setStartTime] = useState('14:00');
  const [fullAddress, setFullAddress] = useState(
    'Căn hộ 1204, Vinhomes D’Capitale, Trần Duy Hưng, Hà Nội'
  );
  const [customerNotes, setCustomerNotes] = useState('');
  const [dynamicAttributes, setDynamicAttributes] = useState({});

  // Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Khởi tạo/đồng bộ state khi initialData hoặc activeService thay đổi
  useEffect(() => {
    if (!isOpen) return;

    // Reset dynamicAttributes theo config của dịch vụ đang chọn
    const defaultDynamic = buildDefaultDynamicAttributes(activeService);
    setDynamicAttributes(defaultDynamic);

    // Thời lượng mặc định
    const minH = activeService?.pricing?.minHours || 2;
    const initialH = activeService?.pricing?.stepHours?.includes(3)
      ? 3
      : activeService?.pricing?.stepHours?.[0] || minH;
    setDurationHours(initialH);

    // Người thực hiện
    if (initialData.workerId || (initialData.helperName && initialData.helperName !== 'Người giúp việc phù hợp nhất')) {
      setWorkerOption('SPECIFIC');
      const targetId = initialData.workerId;
      const matched = (workers || []).find((w) => 
        (targetId && (w.id === targetId || w._id === targetId || w.userId === targetId)) ||
        w.name === initialData.helperName
      );
      setSelectedWorkerId(matched?.id || matched?._id || workers[0]?.id || workers[0]?._id || '');
    } else {
      setWorkerOption('MARKET');
      setSelectedWorkerId('');
    }

    if (initialData.address) {
      setFullAddress(initialData.address);
    }
  }, [isOpen, initialData, activeService, workers]);

  // Tính toán chi phí real-time
  const calculationSummary = useMemo(() => {
    return computePricing(activeService, {
      durationHours,
      dynamicAttributes,
    });
  }, [activeService, durationHours, dynamicAttributes]);

  if (!isOpen) return null;

  // Lấy tên người thực hiện hiển thị
  const chosenWorker = (workers || []).find((w) => w.id === selectedWorkerId || w._id === selectedWorkerId);
  const helperDisplayName =
    workerOption === 'SPECIFIC' && chosenWorker
      ? chosenWorker.name
      : workerOption === 'AUTO'
      ? 'Hệ thống tự động ghép'
      : initialData.helperName && initialData.helperName !== 'Người giúp việc phù hợp nhất'
      ? initialData.helperName
      : 'Chợ việc làm (Chờ nhận)';

  // Handler cập nhật dynamic attributes
  const handleDynamicChange = (key, value) => {
    setDynamicAttributes((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleToggleMulti = (key, itemValue) => {
    setDynamicAttributes((prev) => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const next = current.includes(itemValue)
        ? current.filter((v) => v !== itemValue)
        : [...current, itemValue];
      return { ...prev, [key]: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập tài khoản Khách hàng để đặt dịch vụ!');
      navigate('/login');
      return;
    }

    const summaryText = summarizeDynamicAttributes(activeService, dynamicAttributes);

    const bookingPayload = {
      // Customer info
      customerName: user?.name || 'Khách hàng',
      customerEmail: user?.email || '',
      customerPhone: user?.phone || '',

      // 1. serviceId & serviceTitle
      serviceId: activeService?.id || activeService?._id,
      serviceCode: activeService?.serviceCode,
      serviceTitle: activeService?.title,
      service: activeService?.title,

      // 2. workerOption & dispatchMode
      dispatchMode: workerOption,
      workerOption:
        workerOption === 'MARKET'
          ? 'Đăng lên Chợ việc làm'
          : workerOption === 'AUTO'
          ? 'Người giúp việc phù hợp nhất'
          : 'Chọn nhân viên cụ thể',
      workerId: workerOption === 'SPECIFIC' ? chosenWorker?.id || chosenWorker?._id : null,
      helper: helperDisplayName,

      // 3. durationHours
      durationHours,

      // 4. workDate
      workDate,
      date: workDate.split('-').reverse().join('/'),

      // 5. startTime
      startTime,
      time: `${startTime} (${durationHours} tiếng)`,

      // 6. fullAddress
      fullAddress,
      address: fullAddress,

      // 7. customerNotes
      customerNotes,
      notes: customerNotes,

      // 8. dynamicAttributes
      dynamicAttributes,
      dynamicSummary: summaryText,

      // 9. calculationSummary
      calculationSummary: {
        basePrice: calculationSummary.basePrice,
        extraFee: calculationSummary.extraFee,
        totalPrice: calculationSummary.totalPrice,
      },
      price: `${calculationSummary.totalPrice.toLocaleString('vi-VN')}đ`,
      totalPrice: calculationSummary.totalPrice,
    };

    const newBooking = await addBooking(bookingPayload);
    setCreatedBooking(newBooking);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  // Cấu hình các trường động
  const formFields = activeService?.bookingFormConfig?.fields || [];
  const pricingConfig = activeService?.pricing || {};
  const isHourlyService = pricingConfig.type === PRICING_TYPES.HOURLY;
  const stepHours = pricingConfig.stepHours || [2, 3, 4, 6];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {isSuccess ? 'Đặt lịch thành công!' : 'Đặt dịch vụ'}
              </h3>
              <p className="text-[11px] text-slate-400">Dịch vụ uy tín • Cam kết chất lượng</p>
            </div>
          </div>
          <button
            type="button"
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
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Mã đơn: <strong className="text-blue-600 font-bold">{createdBooking?.id}</strong>. 
              {workerOption === 'SPECIFIC'
                ? ` Nhân viên ${helperDisplayName} sẽ xác nhận và liên hệ trong ít phút.`
                : ' Hệ thống đang tự động điều phối người giúp việc phù hợp nhất cho bạn.'}
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs space-y-2 border border-slate-100 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Dịch vụ:</span>
                <span className="font-bold text-slate-800">{createdBooking?.serviceTitle || createdBooking?.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Người thực hiện:</span>
                <span className="font-bold text-slate-800">{createdBooking?.helper}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian:</span>
                <span className="font-bold text-slate-800">
                  {createdBooking?.workDate} lúc {createdBooking?.startTime} ({createdBooking?.durationHours} giờ)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Địa chỉ:</span>
                <span className="font-medium text-slate-700 text-right max-w-xs truncate">{createdBooking?.fullAddress}</span>
              </div>
              {createdBooking?.dynamicSummary && (
                <div className="pt-2 border-t border-slate-200/50 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-600">Yêu cầu riêng: </span>
                  {createdBooking.dynamicSummary}
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200/60 pt-2 font-bold text-sm">
                <span className="text-slate-600">Tổng tiền dự kiến:</span>
                <span className="text-blue-600">{createdBooking?.price}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Tiếp tục ở Trang chủ
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  navigate('/customer');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Xem lịch sử đơn</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Service Summary Header Card */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center font-bold shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{activeService?.title}</div>
                  <div className="text-[11px] text-blue-700 font-semibold">{helperDisplayName}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900">
                  {pricingConfig.formattedPrice || `${formatVND(pricingConfig.pricePerHour)}/giờ`}
                </span>
                <div className="text-[10px] text-slate-500">
                  Đánh giá: {activeService?.rating} ★ ({activeService?.reviewCount})
                </div>
              </div>
            </div>

            {/* Chọn hình thức người giúp việc: MARKET, AUTO hoặc CHỌN CỤ THỂ */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Hình thức phân công (Điều phối)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWorkerOption('MARKET');
                    setSelectedWorkerId('');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    workerOption === 'MARKET'
                      ? 'bg-blue-50/70 border-blue-500 text-blue-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    {workerOption === 'MARKET' && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    <span>Chợ việc làm</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Công khai trên Chợ, người nhận sớm sẽ làm
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWorkerOption('AUTO');
                    setSelectedWorkerId('');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    workerOption === 'AUTO'
                      ? 'bg-blue-50/70 border-blue-500 text-blue-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    {workerOption === 'AUTO' && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    <span>Ghép nhanh (AUTO)</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Ưu tiên 5 phút cho CTV Cấp 2 điểm cao
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWorkerOption('SPECIFIC');
                    if (!selectedWorkerId && workers.length > 0) {
                      setSelectedWorkerId(workers[0].id || workers[0]._id);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    workerOption === 'SPECIFIC'
                      ? 'bg-blue-50/70 border-blue-500 text-blue-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    {workerOption === 'SPECIFIC' && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    <span>Chỉ định cụ thể</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Gửi lời mời trực tiếp đến người bạn chọn
                  </div>
                </button>
              </div>

              {/* Danh sách nhân viên để chọn nếu chọn SPECIFIC */}
              {workerOption === 'SPECIFIC' && (
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {workers.map((w) => {
                    const workerId = w.id || w._id;
                    const isSelected = selectedWorkerId === workerId;
                    return (
                      <div
                        key={workerId}
                        onClick={() => setSelectedWorkerId(workerId)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <img
                          src={w.avatar}
                          alt={w.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate">{w.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {w.rating} ★ • {w.area}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Thời lượng ca làm việc */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Thời lượng ca làm việc
                </label>
                <span className="text-[11px] text-slate-400">
                  {isHourlyService ? 'Tối thiểu 2 giờ' : 'Theo quy mô công việc'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {stepHours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDurationHours(h)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      durationHours === h 
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
                  Ngày làm việc <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giờ bắt đầu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Địa chỉ làm việc <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <textarea
                  required
                  rows={2}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="Nhập số nhà, tên đường, quận/huyện..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
                />
              </div>
            </div>

            {/* ================= DYNAMIC FORM ATTRIBUTES ================= */}
            {formFields.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tuỳ chọn riêng cho "{activeService?.title}"</span>
                </div>

                {formFields.map((field) => {
                  // Điều kiện ẩn nếu toggle cha đang tắt
                  if (field.hideWhen && !dynamicAttributes[field.hideWhen]) {
                    return null;
                  }

                  const currentValue = dynamicAttributes[field.key];

                  // 1. SELECT FIELD (ví dụ: diện tích m², khẩu vị, loại máy giặt,...)
                  if (field.type === 'select') {
                    return (
                      <div key={field.key}>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                          <select
                            value={currentValue || ''}
                            onChange={(e) => handleDynamicChange(field.key, e.target.value)}
                            className="w-full appearance-none px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 pr-8"
                          >
                            {(field.options || []).map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label} {opt.extraFee ? `(+${formatVND(opt.extraFee)})` : opt.extraFeePerHour ? `(+${formatVND(opt.extraFeePerHour)}/giờ)` : ''}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {field.hint && (
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Info className="w-3 h-3 text-slate-400" />
                            <span>{field.hint}</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // 2. MULTI SELECT (ví dụ: khu vực ưu tiên, công việc trông trẻ, kỹ năng đặc biệt)
                  if (field.type === 'multi') {
                    const selectedList = Array.isArray(currentValue) ? currentValue : [];
                    return (
                      <div key={field.key}>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {field.label}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {(field.options || []).map((opt) => {
                            const isChecked = selectedList.includes(opt.value);
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleToggleMulti(field.key, opt.value)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                                  isChecked
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 text-blue-600" />}
                                <span>{opt.label}</span>
                                {opt.extraFee ? (
                                  <span className="text-[10px] text-amber-600 font-semibold">
                                    (+{formatVND(opt.extraFee)})
                                  </span>
                                ) : opt.extraFeePerHour ? (
                                  <span className="text-[10px] text-amber-600 font-semibold">
                                    (+{formatVND(opt.extraFeePerHour)}/giờ)
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // 3. TOGGLE FIELD (ví dụ: có thú cưng, mang dụng cụ, giặt tay,...)
                  if (field.type === 'toggle') {
                    const isChecked = !!currentValue;
                    return (
                      <label
                        key={field.key}
                        className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div className="pr-3">
                          <div className="text-xs font-semibold text-slate-800">{field.label}</div>
                          {field.extraFee > 0 && (
                            <div className="text-[11px] text-amber-600 font-bold">
                              Phụ phí: +{formatVND(field.extraFee)}
                            </div>
                          )}
                          {field.extraFeePerHour > 0 && (
                            <div className="text-[11px] text-amber-600 font-bold">
                              Phụ phí: +{formatVND(field.extraFeePerHour)}/giờ
                            </div>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleDynamicChange(field.key, e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                      </label>
                    );
                  }

                  // 4. NUMBER FIELD (ví dụ: số lượng áo cần ủi, số thiết bị vệ sinh,...)
                  if (field.type === 'number') {
                    const numVal = Number(currentValue) || field.min || 1;
                    return (
                      <div key={field.key} className="flex items-center justify-between p-2.5 bg-slate-50/70 border border-slate-200 rounded-xl">
                        <div>
                          <div className="text-xs font-bold text-slate-800">{field.label}</div>
                          {field.hint && (
                            <div className="text-[10px] text-slate-500 mt-0.5">{field.hint}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDynamicChange(field.key, Math.max(field.min || 1, numVal - 1))}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-extrabold text-slate-900">
                            {numVal}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDynamicChange(field.key, Math.min(field.max || 20, numVal + 1))}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi chú cho người giúp việc (tùy chọn)
              </label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Ví dụ: Căn hộ tầng 12 bấm chuông cửa, nhà có mèo nhỏ..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            {/* Chi tiết tính giá Breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Cước cơ bản ({calculationSummary.basePriceLabel}):</span>
                <span className="font-semibold text-slate-800">{formatVND(calculationSummary.basePrice)}</span>
              </div>

              {calculationSummary.extraItems.length > 0 && (
                <div className="space-y-1 pt-1">
                  {calculationSummary.extraItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-amber-700">
                      <span>• {item.label}:</span>
                      <span className="font-semibold">+{formatVND(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Tổng thanh toán dự kiến:</span>
                  <div className="text-xl font-black text-blue-600">
                    {formatVND(calculationSummary.totalPrice)}
                  </div>
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Bảo hiểm trách nhiệm 100%</span>
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
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