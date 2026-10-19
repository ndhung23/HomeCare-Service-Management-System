/*
 * Các hàm tiện ích & cấu hình tính giá dịch vụ dùng chung cho Frontend.
 * Dữ liệu thật được lấy từ Backend MongoDB qua API.
 */

export const SERVICE_CODES = {
  CLEANING_HOURLY: 'CLEANING_HOURLY',
  DEEP_CLEANING: 'DEEP_CLEANING',
  PARTY_CLEANUP: 'PARTY_CLEANUP',
  COOKING: 'COOKING',
  LAUNDRY: 'LAUNDRY',
  BABYSITTING: 'BABYSITTING',
  ELDERLY_CARE: 'ELDERLY_CARE',
  APPLIANCE_CLEANING: 'APPLIANCE_CLEANING',
  OFFICE_CLEANING: 'OFFICE_CLEANING',
  CLEANING_PACKAGE: 'CLEANING_PACKAGE',
};

export const PRICING_TYPES = {
  HOURLY: 'HOURLY',
  FIXED_SQM: 'FIXED_SQM',
  PACKAGE: 'PACKAGE',
};

export const SERVICE_CATEGORIES = [
  'Dọn dẹp',
  'Nấu ăn',
  'Giặt ủi',
  'Trông trẻ',
  'Chăm sóc',
  'Sửa chữa - Điện máy',
];

export const SERVICE_AREAS = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Tỉnh/Thành khác'];

export const formatVND = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const opt = (label, extra = {}) => ({ value: label, label, ...extra });

export const M2_AREA_OPTIONS = [
  opt('Dưới 50m² (Studio/1PN)', { sqm: 45 }),
  opt('55 - 85m² (2PN)', { sqm: 70 }),
  opt('85 - 105m² (3PN)', { sqm: 95 }),
  opt('Trên 105m² / Nhà tầng', { sqm: 130 }),
];

export const PRIORITY_OPTIONS = [
  opt('Phòng khách'),
  opt('Nhà bếp'),
  opt('Toilet'),
  opt('Phòng ngủ'),
  opt('Ban công'),
];

export const TASTE_STYLE_OPTIONS = [
  opt('Khẩu vị Miền Bắc'),
  opt('Khẩu vị Miền Trung'),
  opt('Khẩu vị Miền Nam'),
  opt('Ăn chay/Kiêng'),
];

export const EATER_COUNT_OPTIONS = [
  opt('1-2 người'),
  opt('3-4 người', { extraFee: 30000 }),
  opt('5-6 người', { extraFee: 60000 }),
  opt('Trên 6 người', { extraFee: 100000 }),
];

export const CHILD_AGE_OPTIONS = [
  opt('Dưới 1 tuổi'),
  opt('1 - 3 tuổi'),
  opt('4 - 6 tuổi'),
  opt('Trên 6 tuổi'),
];

export const CAREGIVER_GENDER_OPTIONS = [
  opt('Ưu tiên Nữ'),
  opt('Ưu tiên Nam'),
  opt('Không yêu cầu'),
];

export const resolveService = (initialData = {}, services = []) => {
  if (!services || services.length === 0) return null;
  const targetId = initialData.serviceId || initialData.id;
  if (targetId) {
    const byId = services.find(
      (s) =>
        s.id === targetId ||
        s._id === targetId ||
        s.serviceCode?.toLowerCase() === String(targetId).toLowerCase()
    );
    if (byId) return byId;
  }
  const keyword = (initialData.service || initialData.serviceTitle || '').trim().toLowerCase();
  if (keyword) {
    const exact = services.find((s) => s.title?.toLowerCase() === keyword);
    if (exact) return exact;
    const partial = services.find(
      (s) => s.title?.toLowerCase().includes(keyword) || keyword.includes(s.title?.toLowerCase())
    );
    if (partial) return partial;
    const byTag = services.find((s) =>
      s.tags?.some((tag) => tag.toLowerCase().includes(keyword) || keyword.includes(tag.toLowerCase()))
    );
    if (byTag) return byTag;
  }
  return services[0] || null;
};

export const buildDefaultDynamicAttributes = (service) => {
  const config = service?.bookingFormConfig || {};
  const values = {};

  (config.fields || []).forEach((field) => {
    if (field.type === 'multi') {
      values[field.key] = field.required && field.options?.length
        ? [field.options[0].value]
        : [];
    } else if (field.type === 'select') {
      values[field.key] = field.required && field.options?.length ? field.options[0].value : '';
    } else if (field.type === 'toggle') {
      values[field.key] = false;
    } else if (field.type === 'number') {
      values[field.key] = field.min || 1;
    }
  });

  return values;
};

export const computePricing = (service, { durationHours, dynamicAttributes = {} } = {}) => {
  const pricing = service?.pricing || {};
  const fields = service?.bookingFormConfig?.fields || [];
  const hours = Math.max(Number(durationHours) || pricing.minHours || 2, pricing.minHours || 1);

  let basePrice = hours * (pricing.pricePerHour || 0);
  let basePriceLabel = `${hours} giờ × ${formatVND(pricing.pricePerHour || 0)}/giờ`;
  let units = 1;
  let areaSqm = null;
  const extraItems = [];

  if (pricing.type === PRICING_TYPES.FIXED_SQM || pricing.type === PRICING_TYPES.PACKAGE) {
    const areaField = fields.find((f) => f.options && f.options.some((o) => o.sqm));
    if (areaField) {
      const areaOption = areaField.options.find((o) => o.value === dynamicAttributes[areaField.key]);
      if (areaOption?.sqm) areaSqm = areaOption.sqm;
    }
    if (areaSqm && pricing.pricePerSqm) {
      basePrice = areaSqm * pricing.pricePerSqm;
      basePriceLabel = `${areaSqm}m² × ${formatVND(pricing.pricePerSqm)}/m²`;
    } else if (pricing.type === PRICING_TYPES.PACKAGE && pricing.packagePrice) {
      const unitField = fields.find((f) => f.role === 'units');
      units = Math.max(1, Number(dynamicAttributes[unitField?.key]) || 1);
      basePrice = pricing.packagePrice * units;
      basePriceLabel = `${units} × ${formatVND(pricing.packagePrice)}/thiết bị (tối thiểu ${hours} giờ)`;
    }
  }

  fields.forEach((field) => {
    if (field.type !== 'select' || !field.options) return;
    const chosen = field.options.find((o) => o.value === dynamicAttributes[field.key]);
    if (chosen?.basePriceOverride) {
      basePrice = chosen.basePriceOverride;
      basePriceLabel = chosen.label;
      extraItems.push({ label: chosen.label, amount: 0, type: 'base' });
    }
  });

  fields.forEach((field) => {
    if (field.hideWhen && !dynamicAttributes[field.hideWhen]) {
      return;
    }

    const value = dynamicAttributes[field.key];

    if (field.type === 'toggle') {
      if (value && field.extraFee) {
        extraItems.push({ label: field.label, amount: field.extraFee, type: 'fee' });
      }
      return;
    }

    if (field.type === 'number') {
      if (field.role === 'units') return;
      const quantity = Math.max(0, Number(value) - (field.freeUnits || 0));
      if (quantity > 0 && field.unitPrice) {
        extraItems.push({
          label: `${field.label} × ${quantity}`,
          amount: quantity * field.unitPrice,
          type: 'fee',
        });
      }
      return;
    }

    if (field.type === 'select' || field.type === 'multi') {
      const selected = Array.isArray(value) ? value : value ? [value] : [];
      selected.forEach((val) => {
        const option = (field.options || []).find((o) => o.value === val);
        if (option?.extraFee) {
          extraItems.push({
            label: option.advance ? 'Tạm ứng tiền đi chợ (hoàn lại phần chưa dùng)' : option.label,
            amount: option.extraFee,
            type: option.advance ? 'advance' : 'fee',
          });
        }
      });
    }
  });

  const extraFee = extraItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  return {
    durationHours: hours,
    basePrice,
    basePriceLabel,
    extraFee,
    extraItems,
    otherFees: extraItems.filter((i) => i.type !== 'advance').reduce((s, i) => s + i.amount, 0),
    advanceFee: extraItems.filter((i) => i.type === 'advance').reduce((s, i) => s + i.amount, 0),
    units,
    areaSqm,
    totalPrice: basePrice + extraFee,
  };
};

export const summarizeDynamicAttributes = (service, dynamicAttributes = {}) =>
  (service?.bookingFormConfig?.fields || [])
    .map((field) => {
      if (field.hideWhen && !dynamicAttributes[field.hideWhen]) return null;
      const value = dynamicAttributes[field.key];
      if (field.type === 'toggle') return value ? field.label : null;
      if (field.type === 'number') {
        const numVal = Number(value);
        return numVal > 0 ? `${field.label}: ${numVal}` : null;
      }
      if (field.type === 'multi') return Array.isArray(value) && value.length ? `${field.label}: ${value.join(', ')}` : null;
      return value ? `${field.label}: ${value}` : null;
    })
    .filter(Boolean)
    .join(' • ');

