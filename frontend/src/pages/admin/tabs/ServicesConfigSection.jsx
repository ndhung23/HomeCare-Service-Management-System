import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Check, 
  X, 
  RefreshCw, 
  Search, 
  Sparkles,
  Calendar,
  Save,
  Tag
} from 'lucide-react';
import serviceApi from '../../../api/serviceApi';
import adminApi from '../../../api/adminApi';
import { formatVND, SERVICE_CATEGORIES, PRICING_TYPES } from '../../../utils/serviceUtils';

const DEFAULT_AREAS = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'];

const ServicesConfigSection = ({ config, fetchConfig, setConfig }) => {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [savingService, setSavingService] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    serviceCode: '',
    category: 'Dọn dẹp',
    pricingType: PRICING_TYPES.HOURLY,
    pricePerHour: 120000,
    pricePerSqm: 25000,
    packagePrice: 350000,
    minHours: 2,
    formattedPrice: '',
    imageUrl: '',
    shortDescription: '',
    description: '',
    tags: '',
    areas: DEFAULT_AREAS,
    isPackage: false,
  });

  // Holiday config state
  const [newHoliday, setNewHoliday] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const data = await serviceApi.getServices();
      setServices(data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách dịch vụ:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      serviceCode: '',
      category: 'Dọn dẹp',
      pricingType: PRICING_TYPES.HOURLY,
      pricePerHour: 120000,
      pricePerSqm: 25000,
      packagePrice: 350000,
      minHours: 2,
      formattedPrice: '120.000đ / giờ',
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=70',
      shortDescription: '',
      description: '',
      tags: 'Dọn dẹp, Phổ biến',
      areas: DEFAULT_AREAS,
      isPackage: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (srv) => {
    setEditingService(srv);
    const pricing = srv.pricing || {};
    setFormData({
      title: srv.title || '',
      serviceCode: srv.serviceCode || '',
      category: srv.category || 'Dọn dẹp',
      pricingType: pricing.type || PRICING_TYPES.HOURLY,
      pricePerHour: pricing.pricePerHour || 120000,
      pricePerSqm: pricing.pricePerSqm || 25000,
      packagePrice: pricing.packagePrice || 350000,
      minHours: pricing.minHours || 2,
      formattedPrice: pricing.formattedPrice || '',
      imageUrl: srv.imageUrl || '',
      shortDescription: srv.shortDescription || '',
      description: srv.description || '',
      tags: Array.isArray(srv.tags) ? srv.tags.join(', ') : '',
      areas: srv.areas && srv.areas.length ? srv.areas : DEFAULT_AREAS,
      isPackage: Boolean(srv.isPackage),
    });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await serviceApi.uploadImage(uploadFormData);
      if (res?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: res.url }));
        alert('Tải ảnh dịch vụ lên thành công!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi tải ảnh dịch vụ lên');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tên dịch vụ');
      return;
    }

    setSavingService(true);
    try {
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const pricingPayload = {
        type: formData.pricingType,
        minHours: Number(formData.minHours) || 2,
        formattedPrice: formData.formattedPrice || (
          formData.pricingType === PRICING_TYPES.HOURLY
            ? `${formatVND(formData.pricePerHour)} / giờ`
            : formData.pricingType === PRICING_TYPES.FIXED_SQM
            ? `${formatVND(formData.pricePerSqm)} / m²`
            : `${formatVND(formData.packagePrice)} / gói`
        ),
      };

      if (formData.pricingType === PRICING_TYPES.HOURLY) {
        pricingPayload.pricePerHour = Number(formData.pricePerHour) || 0;
      } else if (formData.pricingType === PRICING_TYPES.FIXED_SQM) {
        pricingPayload.pricePerSqm = Number(formData.pricePerSqm) || 0;
        pricingPayload.pricePerHour = Number(formData.pricePerHour) || 0;
      } else if (formData.pricingType === PRICING_TYPES.PACKAGE) {
        pricingPayload.packagePrice = Number(formData.packagePrice) || 0;
        pricingPayload.pricePerHour = Number(formData.pricePerHour) || 0;
      }

      const generatedCode = formData.serviceCode.trim() 
        ? formData.serviceCode.trim().toUpperCase() 
        : `SRV_${Date.now()}`;

      const payload = {
        title: formData.title.trim(),
        serviceCode: generatedCode,
        category: formData.category,
        imageUrl: formData.imageUrl.trim(),
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim(),
        pricing: pricingPayload,
        tags: tagsArray,
        areas: formData.areas,
        isPackage: formData.isPackage,
      };

      if (editingService) {
        await serviceApi.updateService(editingService.id || editingService._id, payload);
        alert('Đã cập nhật dịch vụ thành công!');
      } else {
        await serviceApi.createService(payload);
        alert('Đã tạo dịch vụ mới thành công!');
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi lưu dịch vụ');
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async (service) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${service.title}" không?`)) return;
    try {
      await serviceApi.deleteService(service.id || service._id);
      alert('Đã xóa dịch vụ thành công!');
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi xóa dịch vụ');
    }
  };

  const handleAddHoliday = () => {
    if (!newHoliday) return;
    if ((config?.holidays || []).includes(newHoliday)) {
      alert('Ngày này đã có trong danh sách!');
      return;
    }
    setConfig({
      ...config,
      holidays: [...(config?.holidays || []), newHoliday].sort(),
    });
    setNewHoliday('');
  };

  const handleRemoveHoliday = (dateStr) => {
    setConfig({
      ...config,
      holidays: (config?.holidays || []).filter((h) => h !== dateStr),
    });
  };

  const handleSaveHolidayConfig = async () => {
    setSavingConfig(true);
    try {
      await adminApi.updateConfig(config);
      alert('Đã cập nhật cấu hình ngày lễ và hệ thống thành công!');
      fetchConfig();
    } catch (err) {
      alert('Lỗi khi lưu cấu hình');
    } finally {
      setSavingConfig(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchSearch = !searchTerm || 
      s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.serviceCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-8">
      {/* Cấu hình dịch vụ chi tiết */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Quản lý & Cấu hình Dịch vụ Chi Tiết ({services.length})
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Tùy chỉnh thông tin từng dịch vụ trên toàn hệ thống: Tên, Đơn giá, Ảnh đại diện, Danh mục và Mô tả
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchServices}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600"
              title="Tải lại danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loadingServices ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Thêm dịch vụ mới
            </button>
          </div>
        </div>

        {/* Tìm kiếm và lọc danh mục */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên dịch vụ hoặc mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
          >
            <option value="all">Tất cả danh mục ({services.length})</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Danh sách thẻ dịch vụ */}
        {loadingServices ? (
          <div className="py-12 text-center text-gray-400 text-sm">Đang tải danh sách dịch vụ...</div>
        ) : filteredServices.length === 0 ? (
          <div className="py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
            Không tìm thấy dịch vụ nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((srv) => {
              const pricing = srv.pricing || {};
              return (
                <div
                  key={srv.id || srv._id}
                  className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Ảnh & Header */}
                    <div className="relative h-40 bg-gray-100 overflow-hidden">
                      <img
                        src={srv.imageUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=70'}
                        alt={srv.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=70';
                        }}
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg text-[11px] font-bold">
                        {srv.category}
                      </span>
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/90 text-gray-700 rounded text-[10px] font-mono font-bold shadow-xs">
                        {srv.serviceCode}
                      </span>
                    </div>

                    {/* Nội dung chi tiết */}
                    <div className="p-4 space-y-2">
                      <h5 className="font-bold text-gray-900 text-sm line-clamp-1">{srv.title}</h5>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {srv.shortDescription || srv.description || 'Chưa có mô tả ngắn'}
                      </p>

                      {/* Thông tin giá */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 font-medium">Đơn giá niêm yết:</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {pricing.formattedPrice || (
                            pricing.type === PRICING_TYPES.FIXED_SQM
                              ? `${formatVND(pricing.pricePerSqm)} / m²`
                              : pricing.type === PRICING_TYPES.PACKAGE
                              ? `${formatVND(pricing.packagePrice)} / gói`
                              : `${formatVND(pricing.pricePerHour)} / giờ`
                          )}
                        </span>
                      </div>

                      {/* Tags */}
                      {Array.isArray(srv.tags) && srv.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {srv.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(srv)}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:text-emerald-700 hover:border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" /> Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteService(srv)}
                      className="px-2.5 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cấu hình Ngày Lễ / Tết (Phụ thu +20%) */}
      {config && (
        <div className="border border-gray-200 rounded-2xl p-6 space-y-4 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                Cấu hình Ngày Lễ / Tết (Hệ số phụ thu +{Math.round((config.holidayMultiplier || 0.2) * 100)}%)
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Các ngày lễ đã cấu hình sẽ tự động tính thêm 20% phụ thu khi khách hàng đặt lịch trong ngày này.
              </p>
            </div>
            <button
              onClick={handleSaveHolidayConfig}
              disabled={savingConfig}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> {savingConfig ? 'Đang lưu...' : 'Lưu ngày lễ'}
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="date"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              className="p-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleAddHoliday}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm ngày
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {(config.holidays || []).map((dateStr) => (
              <span
                key={dateStr}
                className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-2"
              >
                <Calendar className="w-3 h-3 text-amber-600" />
                {dateStr}
                <button
                  onClick={() => handleRemoveHoliday(dateStr)}
                  className="text-gray-400 hover:text-rose-600"
                  title="Xóa ngày này"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Modal Cấu hình chi tiết Dịch vụ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingService ? `Chỉnh sửa dịch vụ: ${editingService.title}` : 'Thêm mới dịch vụ chi tiết'}
                </h3>
                <p className="text-xs text-gray-500">Cấu hình tên, đơn giá, ảnh đại diện, danh mục và mô tả</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tên dịch vụ */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Tên dịch vụ <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="vd: Dọn dẹp nhà theo giờ"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Mã dịch vụ */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Mã Code dịch vụ</label>
                  <input
                    type="text"
                    placeholder="vd: CLEANING_HOURLY"
                    value={formData.serviceCode}
                    onChange={(e) => setFormData({ ...formData, serviceCode: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Danh mục */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Danh mục</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Loại tính giá */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Loại hình tính giá</label>
                  <select
                    value={formData.pricingType}
                    onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={PRICING_TYPES.HOURLY}>Theo giờ (HOURLY)</option>
                    <option value={PRICING_TYPES.FIXED_SQM}>Theo diện tích m² (FIXED_SQM)</option>
                    <option value={PRICING_TYPES.PACKAGE}>Theo gói / thiết bị (PACKAGE)</option>
                  </select>
                </div>
              </div>

              {/* Các ô nhập giá tương ứng với loại giá */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 space-y-3">
                <p className="font-semibold text-gray-800 text-[11px] uppercase tracking-wider">Cấu hình Đơn giá chi tiết</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {formData.pricingType === PRICING_TYPES.HOURLY && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-gray-600">Đơn giá / giờ (VNĐ)</label>
                        <input
                          type="number"
                          step="5000"
                          value={formData.pricePerHour}
                          onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-gray-600">Số giờ tối thiểu</label>
                        <input
                          type="number"
                          min="1"
                          max="8"
                          value={formData.minHours}
                          onChange={(e) => setFormData({ ...formData, minHours: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </>
                  )}

                  {formData.pricingType === PRICING_TYPES.FIXED_SQM && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-gray-600">Đơn giá / m² (VNĐ)</label>
                        <input
                          type="number"
                          step="1000"
                          value={formData.pricePerSqm}
                          onChange={(e) => setFormData({ ...formData, pricePerSqm: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-gray-600">Đơn giá / giờ tương đương</label>
                        <input
                          type="number"
                          step="5000"
                          value={formData.pricePerHour}
                          onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </>
                  )}

                  {formData.pricingType === PRICING_TYPES.PACKAGE && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-gray-600">Giá trọn gói (VNĐ)</label>
                        <input
                          type="number"
                          step="10000"
                          value={formData.packagePrice}
                          onChange={(e) => setFormData({ ...formData, packagePrice: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[11px] font-medium text-gray-600">Chuỗi hiển thị (Tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="vd: 120.000đ - 140.000đ / giờ"
                      value={formData.formattedPrice}
                      onChange={(e) => setFormData({ ...formData, formattedPrice: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Ảnh đại diện & upload */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 flex items-center justify-between">
                  <span>Ảnh đại diện dịch vụ (URL hoặc Tải lên Cloudinary)</span>
                  {uploadingImage && <span className="text-emerald-600 font-normal">Đang tải ảnh lên...</span>}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="flex-1 p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" /> Tải ảnh
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {formData.imageUrl && (
                  <div className="mt-2 w-36 h-24 rounded-lg overflow-hidden border border-gray-200">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Mô tả ngắn */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả súc tích hiển thị trên thẻ dịch vụ..."
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Thẻ phân loại */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  Thẻ phân loại (Tags, cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  placeholder="Dọn dẹp, Tiêu chuẩn, Phổ biến"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingService || uploadingImage}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  {savingService ? 'Đang lưu...' : editingService ? 'Lưu cập nhật' : 'Tạo dịch vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesConfigSection;
