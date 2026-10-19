import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBookingPrice } from '../services/pricingService.js';

test('1. CLEANING_HOURLY (Example 1 Role.md 10.8): 3h, 2PN, thú cưng, lau kính', async () => {
  const mockService = {
    _id: 'srv_clean',
    serviceCode: 'CLEANING_HOURLY',
    title: 'Dọn dẹp nhà theo giờ',
    pricing: { type: 'HOURLY', pricePerHour: 100000, minHours: 2 },
    bookingFormConfig: {
      fields: [
        { key: 'areaOption', type: 'select', options: [{ value: '2PN', label: '2PN', extraFee: 30000 }] },
        { key: 'floorsCount', type: 'select', options: [{ value: '1 tầng', label: '1 tầng', extraFee: 0 }] },
        { key: 'hasPet', type: 'toggle', label: 'Thú cưng', extraFee: 30000 },
        { key: 'cleanWindows', type: 'toggle', label: 'Lau kính', extraFee: 40000 },
      ],
    },
  };

  const res = await calculateBookingPrice(mockService, {
    durationHours: 3,
    dynamicAttributes: { areaOption: '2PN', floorsCount: '1 tầng', hasPet: true, cleanWindows: true },
    assigneeRole: 'helper',
  });

  assert.equal(res.basePrice, 300000);
  assert.equal(res.laborTotal, 400000);
  assert.equal(res.totalPrice, 400000);
  assert.equal(res.platformFee, 80000); // 20%
  assert.equal(res.helperEarnings, 320000); // 80%
});

test('2. CLEANING_HOURLY for Enterprise (Example 2 Role.md 10.8): 12% fee rate', async () => {
  const mockService = {
    _id: 'srv_clean',
    serviceCode: 'CLEANING_HOURLY',
    title: 'Dọn dẹp nhà theo giờ',
    pricing: { type: 'HOURLY', pricePerHour: 100000, minHours: 2 },
    bookingFormConfig: {
      fields: [
        { key: 'areaOption', type: 'select', options: [{ value: '2PN', label: '2PN', extraFee: 30000 }] },
        { key: 'hasPet', type: 'toggle', label: 'Thú cưng', extraFee: 30000 },
        { key: 'cleanWindows', type: 'toggle', label: 'Lau kính', extraFee: 40000 },
      ],
    },
  };

  const res = await calculateBookingPrice(mockService, {
    durationHours: 3,
    dynamicAttributes: { areaOption: '2PN', hasPet: true, cleanWindows: true },
    assigneeRole: 'enterprise',
  });

  assert.equal(res.laborTotal, 400000);
  assert.equal(res.platformFee, 48000); // 12%
  assert.equal(res.helperEarnings, 352000); // 88%
});

test('3. COOKING with grocery shopping advance (Example 3 Role.md 10.8): Advance not subject to platform fee', async () => {
  const mockService = {
    _id: 'srv_cook',
    serviceCode: 'COOKING',
    title: 'Nấu ăn gia đình',
    pricing: { type: 'HOURLY', pricePerHour: 110000, minHours: 2 },
    bookingFormConfig: {
      fields: [
        { key: 'eaterCount', type: 'select', options: [{ value: '4 người', label: '4 người', extraFee: 30000 }] },
        { key: 'groceryShopping', type: 'toggle', label: 'Đi chợ hộ', extraFee: 40000 },
        { key: 'groceryBudget', type: 'select', options: [{ value: '250k', label: 'Tạm ứng', extraFee: 250000, advance: true }] },
      ],
    },
  };

  const res = await calculateBookingPrice(mockService, {
    durationHours: 3,
    dynamicAttributes: { eaterCount: '4 người', groceryShopping: true, groceryBudget: '250k' },
    assigneeRole: 'helper',
  });

  assert.equal(res.basePrice, 330000);
  assert.equal(res.laborTotal, 400000); // 330k + 30k + 40k
  assert.equal(res.advanceFee, 250000);
  assert.equal(res.totalPrice, 650000);
  assert.equal(res.platformFee, 80000); // 20% on 400k labor ONLY
  assert.equal(res.helperEarnings, 570000); // 320k labor + 250k advance reimbursed 100%
});

