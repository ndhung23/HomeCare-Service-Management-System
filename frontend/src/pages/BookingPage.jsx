import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  Info,
  Check,
  Users,
  ArrowLeft
} from 'lucide-react';
import {
  mockServices,
  getServiceById,
  mockWorkers,
  buildDefaultDynamicAttributes,
  computePricing,
  formatVND,
  summarizeDynamicAttributes,
  PRICING_TYPES
} from '../mock/servicesData';

const BookingPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user, addBooking } = useAuth();
  const navigate = useNavigate();

  // Xác định dịch vụ hiện tại dựa trên id từ URL param
  const activeService = useMemo(() => {
    return getServiceById(id) || mockServices[0];
  }, [id]);

  const initialHelperParam = searchParams.get('helper') || searchParams.get('helperName');
  const initialAddressParam = searchParams.get('address');

  // Các state form cơ bản
  const [workerOption, setWorkerOption] = useState('AUTO'); // 'AUTO' | 'SPECIFIC'
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [durationHours, setDurationHours] = useState(3);
  const [workDate, setWorkDate] = useState('2026-09-28');
  const [startTime, setStartTime] = useState('14:00');
  const [fullAddress, setFullAddress] = useState(
    initialAddressParam || 'Căn hộ 1204, Vinhomes D’Capitale, Trần Duy Hưng, Hà Nội'
  );
  const [customerNotes, setCustomerNotes] = useState('');
  const [dynamicAttributes, setDynamicAttributes] = useState({});

  // Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Khởi tạo/đồng bộ state khi activeService hoặc params thay đổi
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!activeService) return;

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
    if (initialHelperParam && initialHelperParam !== 'Người giúp việc phù hợp nhất') {
      setWorkerOption('SPECIFIC');
      const matched = mockWorkers.find((w) => 
        w.name.toLowerCase() === initialHelperParam.toLowerCase() ||
        w.id.toLowerCase() === initialHelperParam.toLowerCase()
      );
      setSelectedWorkerId(matched?.id || mockWorkers[0]?.id || '');
    } else {
      setWorkerOption('AUTO');
      setSelectedWorkerId('');
    }

    if (initialAddressParam) {
      setFullAddress(initialAddressParam);
    }
  }, [activeService, initialHelperParam, initialAddressParam]);

  // Tính toán chi phí real-time
  const calculationSummary = useMemo(() => {
    return computePricing(activeService, {
      durationHours,
      dynamicAttributes,
    });
  }, [activeService, durationHours, dynamicAttributes]);

  // Lấy tên người thực hiện hiển thị
  const chosenWorker = mockWorkers.find((w) => w.id === selectedWorkerId);
  const helperDisplayName =
    workerOption === 'SPECIFIC' && chosenWorker
      ? chosenWorker.name
      : initialHelperParam && initialHelperParam !== 'Người giúp việc phù hợp nhất'
      ? initialHelperParam
      : 'Người giúp việc phù hợp nhất';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập tài khoản Khách hàng để đặt dịch vụ!');
      navigate('/login');
      return;
    }

    const summaryText = summarizeDynamicAttributes(activeService, dynamicAttributes);

    const bookingPayload = {
      // 1. serviceId & serviceTitle
      serviceId: activeService?.id,
      serviceCode: activeService?.serviceCode,
      serviceTitle: activeService?.title,
      service: activeService?.title, // giữ tương thích hiển thị cũ

      // 2. workerOption
      workerOption: workerOption === 'AUTO' ? 'Người giúp việc phù hợp nhất' : 'Chọn nhân viên cụ thể',
      workerId: workerOption === 'SPECIFIC' ? chosenWorker?.id : null,
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
      note: customerNotes,

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
    };

    const newBooking = addBooking(bookingPayload);
    setCreatedBooking(newBooking);
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cấu hình các trường động
  const formFields = activeService?.bookingFormConfig?.fields || [];
  const pricingConfig = activeService?.pricing || {};
  const isHourlyService = pricingConfig.type === PRICING_TYPES.HOURLY;
  const stepHours = pricingConfig.stepHours || [2, 3, 4, 6];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách dịch vụ</span>
          </Link>
          <div className="text-xs text-slate-400">
            Mã dịch vụ: <strong className="text-slate-700">{activeService?.id}</strong>
          </div>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          /* Success Screen */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-xs">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Đặt lịch dịch vụ thành công!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
              Mã đơn: <strong className="text-blue-600 font-bold">{createdBooking?.id}</strong>. 
              {workerOption === 'SPECIFIC'
                ? ` Nhân viên ${helperDisplayName} sẽ xác nhận và liên hệ trong ít phút.`
                : ' Hệ thống đang tự động điều phối người giúp việc phù hợp nhất cho bạn.'}
            </p>

            <div className="bg-slate-50 rounded-2xl p-5 text-left text-xs sm:text-sm space-y-3 border border-slate-100 mb-6">
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
              <div className="flex justify-between border-t border-slate-200/60 pt-2 font-bold text-sm sm:text-base">
                <span className="text-slate-600">Tổng tiền dự kiến:</span>
                <span className="text-blue-600">{createdBooking?.price}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/services"
                className="py-2.5 px-5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Đặt thêm dịch vụ khác
              </Link>
              <button
                type="button"
                onClick={() => navigate('/customer')}
                className="py-2.5 px-5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Xem lịch sử đơn hàng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen 2-column layout */
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Input Column (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                
                {/* Header Dịch vụ */}
                <div className="border-b border-slate-100 pb-4">
                  <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Form đặt dịch vụ
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                    {activeService?.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {activeService?.shortDescription}
                  </p>
                </div>

            {/* Chọn hình thức người giúp việc: AUTO hoặc CHỌN CỤ THỂ */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Hình thức phân công</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
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
                    <span>Phù hợp nhất (AUTO)</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Hệ thống tự động tìm người gần nhất, nhận ca nhanh
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWorkerOption('SPECIFIC');
                    if (!selectedWorkerId && mockWorkers.length > 0) {
                      setSelectedWorkerId(mockWorkers[0].id);
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
                    <span>Chọn nhân viên cụ thể</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Chủ động lựa chọn nhân viên ưng ý theo hồ sơ
                  </div>
                </button>
              </div>

              {/* Danh sách nhân viên để chọn nếu chọn SPECIFIC */}
              {workerOption === 'SPECIFIC' && (
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mockWorkers.map((w) => {
                    const isSelected = selectedWorkerId === w.id;
                    return (
                      <div
                        key={w.id}
                        onClick={() => setSelectedWorkerId(w.id)}
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
                  Ngày làm việc
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
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
                Địa chỉ làm việc
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
                                {opt.label} {opt.extraFee ? `(+${formatVND(opt.extraFee)})` : ''}
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
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ghi chú cho người giúp việc (tùy chọn)
              </label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Ví dụ: Căn hộ tầng 12 bấm chuông cửa, nhà có mèo nhỏ..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              />
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (STICKY - 5 Cột) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Tóm tắt đơn đặt lịch
                </h3>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  Báo giá dự kiến
                </span>
              </div>

              {/* Service Card info */}
              <div className="flex gap-3.5 items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <img
                  src={activeService?.imageUrl}
                  alt={activeService?.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-slate-900 truncate">{activeService?.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {pricingConfig.formattedPrice || `${formatVND(pricingConfig.pricePerHour)}/giờ`}
                  </div>
                  <div className="text-[10px] text-amber-500 font-bold mt-1 flex items-center gap-1">
                    <span>★ {activeService?.rating || 4.9}</span>
                    <span className="text-slate-400 font-normal">({activeService?.reviewCount || 100}+ đánh giá)</span>
                  </div>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Người thực hiện:</span>
                  <span className="font-bold text-slate-800 text-right max-w-[200px] truncate">
                    {helperDisplayName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời gian:</span>
                  <span className="font-bold text-slate-800">
                    {workDate} lúc {startTime} {isHourlyService ? `(${durationHours} giờ)` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-3">
                  <span className="text-slate-400 shrink-0">Địa điểm:</span>
                  <span className="font-medium text-slate-700 text-right truncate max-w-[200px]">
                    {fullAddress}
                  </span>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Cước cơ bản ({calculationSummary.basePriceLabel}):</span>
                  <span className="font-bold text-slate-900">{formatVND(calculationSummary.basePrice)}</span>
                </div>

                {calculationSummary.extraItems.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-dashed border-slate-200">
                    {calculationSummary.extraItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] text-amber-700">
                        <span>• {item.label}:</span>
                        <span className="font-bold">+{formatVND(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Tổng thanh toán dự kiến:</div>
                    <div className="text-2xl font-black text-blue-600 mt-0.5">
                      {formatVND(calculationSummary.totalPrice)}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400">Đã gồm VAT &amp; bảo hiểm</div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Xác nhận đặt lịch ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Trust guarantees */}
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cam kết bảo hiểm trách nhiệm &amp; hỗ trợ đổi người miễn phí</span>
              </div>
            </div>
          </div>

        </div>
      </form>
    )}
  </main>

  <Footer />
</div>
);
};

export default BookingPage;