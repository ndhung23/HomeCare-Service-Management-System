export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  UPCOMING: 'UPCOMING',
  IN_PROGRESS: 'IN_PROGRESS',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
};

const ALLOWED_TRANSITIONS = {
  PENDING: [
    { to: 'UPCOMING', roles: ['helper', 'enterprise', 'admin'] },
    { to: 'CANCELLED', roles: ['customer', 'admin'] },
  ],
  UPCOMING: [
    { to: 'IN_PROGRESS', roles: ['helper', 'enterprise', 'admin'] },
    { to: 'CANCELLED', roles: ['customer', 'helper', 'enterprise', 'admin'] }, // via mutual confirmation or admin
  ],
  IN_PROGRESS: [
    { to: 'AWAITING_PAYMENT', roles: ['helper', 'enterprise', 'admin'] },
  ],
  AWAITING_PAYMENT: [
    { to: 'COMPLETED', roles: ['admin'] },
    { to: 'DISPUTED', roles: ['customer', 'helper', 'enterprise', 'admin'] },
  ],
  COMPLETED: [
    { to: 'DISPUTED', roles: ['customer', 'helper', 'enterprise', 'admin'] },
  ],
  CANCELLED: [],
  DISPUTED: [
    { to: 'COMPLETED', roles: ['admin'] },
    { to: 'CANCELLED', roles: ['admin'] },
  ],
};

export const canTransition = (fromStatus, toStatus, userRole) => {
  if (userRole === 'admin') return true;
  const transitions = ALLOWED_TRANSITIONS[fromStatus] || [];
  return transitions.some(
    (t) => t.to === toStatus && (t.roles.includes(userRole) || t.roles.includes('*'))
  );
};

export const assertTransition = (fromStatus, toStatus, userRole) => {
  if (!canTransition(fromStatus, toStatus, userRole)) {
    throw new Error(
      `Không thể chuyển trạng thái từ "${fromStatus}" sang "${toStatus}" với vai trò ${userRole || 'khách'}`
    );
  }
};

export default {
  BOOKING_STATUS,
  canTransition,
  assertTransition,
};

