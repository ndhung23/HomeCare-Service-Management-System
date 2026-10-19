import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransition, assertTransition } from '../services/bookingStateMachine.js';

test('Booking State Machine: Valid Transitions', () => {
  // Helper can accept PENDING -> UPCOMING
  assert.equal(canTransition('PENDING', 'UPCOMING', 'helper'), true);
  // Helper can start UPCOMING -> IN_PROGRESS
  assert.equal(canTransition('UPCOMING', 'IN_PROGRESS', 'helper'), true);
  // Helper can complete IN_PROGRESS -> AWAITING_PAYMENT
  assert.equal(canTransition('IN_PROGRESS', 'AWAITING_PAYMENT', 'helper'), true);
  // Admin can confirm payment AWAITING_PAYMENT -> COMPLETED
  assert.equal(canTransition('AWAITING_PAYMENT', 'COMPLETED', 'admin'), true);
});

test('Booking State Machine: Invalid Transitions blocked', () => {
  // Helper cannot confirm payment
  assert.equal(canTransition('AWAITING_PAYMENT', 'COMPLETED', 'helper'), false);
  // Cannot jump from PENDING to COMPLETED directly
  assert.equal(canTransition('PENDING', 'COMPLETED', 'helper'), false);
  // Customer cannot start a booking
  assert.equal(canTransition('UPCOMING', 'IN_PROGRESS', 'customer'), false);

  assert.throws(() => {
    assertTransition('AWAITING_PAYMENT', 'COMPLETED', 'helper');
  });
});

