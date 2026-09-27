import React from 'react';
import {
  SlidersHorizontal,
  Search,
  RotateCcw,
  ChevronDown,
  Tag,
  MapPin,
  Wallet,
  Star,
} from 'lucide-react';

const SELECT_CLASS =
  'w-full appearance-none bg-white border border-slate-200 rounded-xl pl-8 pr-7 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer';
const CHEVRON_CLASS =
  'w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none';

/**
 * Bộ lọc dịch vụ (cột trái 2/12 của trang /services).
 * State được quản lý ở ServicesPage, component này chỉ render UI + bắn callback.
 */
const ServiceFilterSidebar = ({
  filters,
  onChange,
  onReset,
  categories = [],
  areas = [],
  priceOptions = [],
  ratingOptions = [],
  activeCount = 0,
  className = '',
  categoryField = 'category',
  priceField = 'price',
  keywordPlaceholder = 'Tên dịch vụ, kỹ năng...',
  categoryLabel = 'Danh mục',
  priceLabel = 'Mức giá',
  priceHint = 'Áp dụng cho đơn giá theo giờ của dịch vụ.',
  ratingHint = 'Chỉ hiển thị dịch vụ đạt mức điểm tối thiểu bạn chọn.',
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-xs p-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-900">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-extrabold">Bộ lọc</span>
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Xóa</span>
        </button>
      </div>

      {/* 1. Từ khóa */}
      <div className="mb-3">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
          Từ khóa
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => onChange('keyword', e.target.value)}
            placeholder={keywordPlaceholder}
            className="w-full border border-slate-200 rounded-xl pl-8 pr-2.5 py-2 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* 2. Danh mục dịch vụ (dropdown) */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            {categoryLabel}
          </label>
        </div>
        <div className="relative">
          <select
            value={filters[categoryField]}
            onChange={(e) => onChange(categoryField, e.target.value)}
            className={SELECT_CLASS}
          >
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown className={CHEVRON_CLASS} />
        </div>
      </div>

      {/* 3. Khu vực hoạt động (dropdown) */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Khu vực
          </label>
        </div>
        <div className="relative">
          <select
            value={filters.area}
            onChange={(e) => onChange('area', e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="all">Tất cả khu vực</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          <ChevronDown className={CHEVRON_CLASS} />
        </div>
      </div>

      {/* 4. Mức giá */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Wallet className="w-3.5 h-3.5 text-slate-400" />
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            {priceLabel}
          </label>
        </div>
        <div className="space-y-1">
          {priceOptions.map((opt) => {
            const checked = filters[priceField] === opt.id;
            return (
              <label
                key={opt.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer transition-all ${
                  checked
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="service-price-filter"
                  value={opt.id}
                  checked={checked}
                  onChange={() => onChange(priceField, opt.id)}
                  className="w-3.5 h-3.5 accent-blue-600 shrink-0 cursor-pointer"
                />
                <span className="text-[11px] font-semibold leading-tight">{opt.label}</span>
              </label>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 leading-snug mt-1.5">
          {priceHint}
        </p>
      </div>

      {/* 5. Đánh giá tối thiểu (dropdown) */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Star className="w-3.5 h-3.5 text-slate-400" />
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Đánh giá
          </label>
        </div>
        <div className="relative">
          <select
            value={filters.rating}
            onChange={(e) => onChange('rating', e.target.value)}
            className={SELECT_CLASS}
          >
            {ratingOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className={CHEVRON_CLASS} />
        </div>
        <p className="text-[10px] text-slate-400 leading-snug mt-1.5">
          {ratingHint}
        </p>
      </div>

      {/* Xóa toàn bộ bộ lọc */}
      <button
        type="button"
        onClick={onReset}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Xóa tất cả bộ lọc</span>
      </button>
    </div>
  );
};

export default ServiceFilterSidebar;
