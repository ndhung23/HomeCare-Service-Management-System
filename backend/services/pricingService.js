import mongoose from 'mongoose';
import Service from '../models/Service.js';

export const calculateBookingPrice = async (serviceIdentifier, { durationHours = 2, dynamicAttributes = {}, assigneeRole = 'helper' } = {}) => {
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

  const pricing = service.pricing || {};
  const fields = service.bookingFormConfig?.fields || [];
  const hours = Math.max(Number(durationHours) || pricing.minHours || 2, pricing.minHours || 1);

  let basePrice = hours * (pricing.pricePerHour || 0);
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

  const laborExtra = extraItems.filter((i) => i.type !== 'advance').reduce((sum, i) => sum + i.amount, 0);
  const advanceFee = extraItems.filter((i) => i.type === 'advance').reduce((sum, i) => sum + i.amount, 0);

  const laborTotal = basePrice + laborExtra;
  const totalPrice = laborTotal + advanceFee;

  const feeRate = assigneeRole === 'enterprise' ? 0.12 : 0.20;
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
