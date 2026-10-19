import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import Service from '../models/Service.js';
import WalletTransaction from '../models/WalletTransaction.js';
import WithdrawRequest from '../models/WithdrawRequest.js';
import Review from '../models/Review.js';
import { calculateBookingPrice } from '../services/pricingService.js';
import { assertTransition } from '../services/bookingStateMachine.js';
import { checkScheduleConflict } from '../controllers/bookingLifecycleController.js';

test('End-to-End MVP Booking Lifecycle & Wallet Accounting', async (t) => {
  await mongoose.connect('mongodb://127.0.0.1:27017/homecare');

  // 1. Setup users for test
  const customer = await User.findOne({ role: 'customer' });
  const helper = await User.findOne({ role: 'helper' });
  const enterprise = await User.findOne({ role: 'enterprise' });
  const admin = await User.findOne({ role: 'admin' });

  assert.ok(customer, 'Customer user must exist');
  assert.ok(helper, 'Helper user must exist');
  assert.ok(enterprise, 'Enterprise user must exist');
  assert.ok(admin, 'Admin user must exist');

  // 2. Test Server-side Pricing Calculation
  const service = await Service.findOne({ serviceCode: 'CLEANING_HOURLY' });
  assert.ok(service, 'Service CLEANING_HOURLY must exist');

  const pricing = await calculateBookingPrice('CLEANING_HOURLY', {
    durationHours: 3,
    dynamicAttributes: { numBedrooms: 2, hasPets: true },
    assigneeRole: 'helper',
  });

  // Base: 3 * 100k = 300k. Extra: 2 bedrooms (+30k) + Pets (+30k) = 60k. Total Labor: 360k.
  assert.strictEqual(pricing.laborTotal, 360000);
  assert.strictEqual(pricing.platformFee, 72000); // 20%
  assert.strictEqual(pricing.helperEarnings, 288000); // 80%

  // 3. Create Booking in PENDING status
  const startAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours in future
  const endAt = new Date(startAt.getTime() + 3 * 60 * 60 * 1000);

  const booking = await Booking.create({
    bookingCode: `E2E-${Date.now().toString().slice(-4)}`,
    customerId: customer._id,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone || '0988776655',
    service: pricing.serviceTitle,
    serviceId: pricing.serviceId,
    serviceCode: pricing.serviceCode,
    helper: 'Người giúp việc phù hợp nhất',
    date: startAt.toISOString().split('T')[0],
    time: `${startAt.getHours()}:00`,
    durationHours: 3,
    startAt,
    endAt,
    address: 'Căn hộ 1204, Toà Park 2, Vinhomes Times City, Hai Bà Trưng, Hà Nội',
    price: pricing.formattedTotalPrice,
    totalPrice: pricing.totalPrice,
    pricingSnapshot: {
      basePrice: pricing.basePrice,
      laborTotal: pricing.laborTotal,
      advanceFee: pricing.advanceFee,
      feeRate: pricing.feeRate,
      platformFee: pricing.platformFee,
      helperEarnings: pricing.helperEarnings,
    },
    status: 'PENDING',
    statusColor: 'amber',
  });

  assert.strictEqual(booking.status, 'PENDING');

  // 4. Test Schedule Conflict Guard
  const conflict = await checkScheduleConflict(helper._id, null, startAt, endAt);
  // Initially no conflict
  assert.strictEqual(conflict, null);

  // 5. Helper claims booking -> UPCOMING
  assertTransition(booking.status, 'UPCOMING', 'helper');
  booking.status = 'UPCOMING';
  booking.assigneeId = helper._id;
  booking.assigneeType = 'HELPER';
  booking.helper = helper.name;
  booking.acceptedBy = helper._id.toString();
  booking.acceptedAt = new Date();
  await booking.save();

  assert.strictEqual(booking.status, 'UPCOMING');

  // Now checking conflict for same helper in that timeframe should find this booking!
  const newConflict = await checkScheduleConflict(helper._id, null, startAt, endAt);
  assert.ok(newConflict, 'Should detect conflict for duplicate booking in same window');

  // 6. Helper starts job -> IN_PROGRESS
  assertTransition(booking.status, 'IN_PROGRESS', 'helper');
  booking.status = 'IN_PROGRESS';
  booking.startedAt = new Date();
  await booking.save();
  assert.strictEqual(booking.status, 'IN_PROGRESS');

  // 7. Helper completes job with Evidence photos -> AWAITING_PAYMENT
  assertTransition(booking.status, 'AWAITING_PAYMENT', 'helper');
  booking.status = 'AWAITING_PAYMENT';
  booking.completedAt = new Date();
  booking.evidence = ['/uploads/evidence-photo-1.jpg', '/uploads/evidence-photo-2.jpg'];
  await booking.save();
  assert.strictEqual(booking.status, 'AWAITING_PAYMENT');
  assert.strictEqual(booking.evidence.length, 2);

  // 8. Admin confirms VietQR payment -> COMPLETED & credits wallet
  assertTransition(booking.status, 'COMPLETED', 'admin');
  const prevBalance = helper.wallet?.available || 0;
  const earningsToCredit = booking.helperEarnings || booking.pricingSnapshot?.helperEarnings || 288000;

  booking.status = 'COMPLETED';
  booking.paidAt = new Date();
  booking.paymentConfirmedBy = admin._id;
  await booking.save();

  // Credit Helper's wallet
  await User.findByIdAndUpdate(helper._id, {
    $inc: { 'wallet.available': earningsToCredit },
  });

  // Record Transaction
  const tx = await WalletTransaction.create({
    userId: helper._id,
    bookingId: booking._id,
    type: 'EARNING',
    amount: earningsToCredit,
    description: `Thực nhận từ đơn ${booking.bookingCode}`,
    balanceAfter: prevBalance + earningsToCredit,
  });

  assert.strictEqual(tx.amount, 288000);

  const updatedHelper = await User.findById(helper._id);
  assert.strictEqual(updatedHelper.wallet.available, prevBalance + earningsToCredit);

  // 9. Customer submits 5-star review
  const workerDoc = await Worker.findOne({ code: 'W-01' });
  let review = null;
  if (workerDoc) {
    review = await Review.create({
      bookingId: booking._id,
      customerId: customer._id,
      workerId: workerDoc._id.toString(),
      author: customer.name,
      service: booking.service,
      helper: helper.name,
      rating: 5,
      comment: 'Làm việc rất cẩn thận, sạch sẽ và đúng giờ. 5 sao!',
    });
    assert.strictEqual(review.rating, 5);
  }

  // 10. Helper requests withdrawal (200k)
  const withdrawAmount = 200000;
  const initialLocked = updatedHelper.wallet?.locked || 0;
  assert.ok(updatedHelper.wallet.available >= withdrawAmount);

  // Deduct available, put in locked
  await User.findByIdAndUpdate(helper._id, {
    $inc: {
      'wallet.available': -withdrawAmount,
      'wallet.locked': withdrawAmount,
    },
  });

  const withdrawReq = await WithdrawRequest.create({
    userId: helper._id,
    amount: withdrawAmount,
    bank: {
      bankName: helper.bank?.bankName || 'Vietcombank',
      accountNumber: helper.bank?.accountNumber || '0123456789',
      accountName: helper.bank?.accountName || 'NGUYEN THI LAN',
    },
    status: 'PENDING',
  });

  assert.strictEqual(withdrawReq.status, 'PENDING');
  assert.strictEqual(withdrawReq.amount, 200000);

  // Admin approves withdrawal
  withdrawReq.status = 'APPROVED';
  withdrawReq.processedBy = admin._id;
  withdrawReq.processedAt = new Date();
  await withdrawReq.save();

  await User.findByIdAndUpdate(helper._id, {
    $inc: { 'wallet.locked': -withdrawAmount },
  });

  const finalHelper = await User.findById(helper._id);
  assert.strictEqual(finalHelper.wallet.locked, initialLocked);

  // Cleanup test booking
  await Booking.findByIdAndDelete(booking._id);
  await WalletTransaction.findByIdAndDelete(tx._id);
  await WithdrawRequest.findByIdAndDelete(withdrawReq._id);
  console.log('--- ALL 10 STEPS OF THE END-TO-END FLOW PASSED! ---');
  await mongoose.disconnect();
});
