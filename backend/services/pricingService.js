import mongoose from 'mongoose';
import Service from '../models/Service.js';
import SystemConfig from '../models/SystemConfig.js';

export const calculateBookingPrice = async (
  serviceIdentifier,
  { durationHours = 2, dynamicAttributes = {}, assigneeRole = 'helper', workDate = '' } = {}
) => {
  let service = null;
  if (serviceIdentifier?._id || serviceIdentifier?.pricing) {
    service = serviceIdentifier;
  } else if (serviceIdentifier) {
    const conditions = [
      { serviceCode: serviceIdentifier },
      { serviceCode: String(serviceIdentifier).toUpperCase() },
      { title: serviceIdentifier },
    ];
    if (mongoose.Types.ObjectId.isValid(serviceIdentifier)) {
      conditions.unshift({ _id: serviceIdentifier });
    }
    service = await Service.findOne({ $or: conditions });
  }

  if (!service) {
    throw new Error('Dịch vụ không tồn tại trong hệ thống');
  }

  // Lấy cấu hình hệ thống động (Role.md Mục 14)
  const systemConfig = await SystemConfig.findOne({ key: 'PRIMARY_CONFIG' }).catch(() => null);

  const pricing = service.pricing || {};
  const fields = service.bookingFormConfig?.fields || [];
  const hours = Math.max(Number(durationHours) || pricing.minHours || 2, pricing.minHours || 1);

  // Đơn giá giờ động từ cấu hình hệ thống (nếu có)
  const configHourlyRate = systemConfig?.baseHourlyRates?.[service.serviceCode];
  const pricePerHour = configHourlyRate || pricing.pricePerHour || 0;

  let basePrice = hours * pricePerHour;
  const extraItems = [];

  fields.forEach((field) => {
    if (field.hideWhen && !dynamicAttributes[field.hideWhen]) {
      return;
    }

    const value = dynamicAttributes[field.key];

    if (field.type === 'toggle') {
      if (value && field.extraFee) {
        extraItems.push({ label: field.label, amount: field.extraFee, type: 'fee' });
      }
      if (value && field.extraFeePerHour) {
        extraItems.push({
          label: `${field.label} (${hours}h × ${field.extraFeePerHour.toLocaleString('vi-VN')}đ)`,
          amount: field.extraFeePerHour * hours,
          type: 'fee',
        });
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
        if (option?.extraFeePerHour) {
          extraItems.push({
            label: `${option.label} (${hours}h × ${option.extraFeePerHour.toLocaleString('vi-VN')}đ)`,
            amount: option.extraFeePerHour * hours,
            type: 'fee',
          });
        }
      });
    }
  });

  let laborExtra = extraItems.filter((i) => i.type !== 'advance').reduce((sum, i) => sum + i.amount, 0);
  const advanceFee = extraItems.filter((i) => i.type === 'advance').reduce((sum, i) => sum + i.amount, 0);

  let initialLabor = basePrice + laborExtra;

  // Kiểm tra phụ thu ngày lễ / Tết (+20% làm tròn 1.000đ theo Role.md Mục 14)
  if (workDate && systemConfig?.holidays && systemConfig.holidays.includes(workDate)) {
    const multiplier = systemConfig.holidayMultiplier || 0.2;
    const holidayFee = Math.round((initialLabor * multiplier) / 1000) * 1000;
    if (holidayFee > 0) {
      extraItems.push({
        label: `Phụ thu ngày Lễ / Tết (+${Math.round(multiplier * 100)}%)`,
        amount: holidayFee,
        type: 'fee',
      });
      laborExtra += holidayFee;
    }
  }

  const laborTotal = basePrice + laborExtra;
  const totalPrice = laborTotal + advanceFee;

  const defaultFeeRate = assigneeRole === 'enterprise' ? 0.12 : 0.20;
  const feeRate = assigneeRole === 'enterprise'
    ? (systemConfig?.enterpriseCommissionRate || 0.12)
    : (systemConfig?.helperCommissionRate || 0.20);

  const platformFee = Math.round(laborTotal * feeRate);
  const helperEarnings = (laborTotal - platformFee) + advanceFee;

  return {
    serviceId: service._id?.toString() || service.id,
    serviceCode: service.serviceCode,
    serviceTitle: service.title,
    durationHours: hours,
    basePrice,
    extraItems,
    laborTotal,
    advanceFee,
    totalPrice,
    feeRate,
    platformFee,
    helperEarnings,
    formattedTotalPrice: `${totalPrice.toLocaleString('vi-VN')}đ`,
  };
};

export default { calculateBookingPrice };
