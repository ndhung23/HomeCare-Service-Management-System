export const BOOKING_STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ người nhận',
    color: 'amber',
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  UPCOMING: {
    label: 'Sắp diễn ra',
    color: 'blue',
    bgClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  IN_PROGRESS: {
    label: 'Đang thực hiện',
    color: 'indigo',
    bgClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-500',
  },
  AWAITING_PAYMENT: {
    label: 'Chờ thanh toán',
    color: 'amber',
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    color: 'emerald',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'rose',
    bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
  },
  DISPUTED: {
    label: 'Đang khiếu nại',
    color: 'purple',
    bgClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
  },
};

export const getBookingStatusInfo = (status) => {
  // Legacy aliases
  if (status === 'Chờ người nhận') return BOOKING_STATUS_CONFIG.PENDING;
  if (status === 'Sắp diễn ra') return BOOKING_STATUS_CONFIG.UPCOMING;
  if (status === 'Đang thực hiện') return BOOKING_STATUS_CONFIG.IN_PROGRESS;
  if (status === 'Đã hoàn thành') return BOOKING_STATUS_CONFIG.COMPLETED;
  if (status === 'Đã hủy') return BOOKING_STATUS_CONFIG.CANCELLED;

  return BOOKING_STATUS_CONFIG[status] || {
    label: status || 'Không xác định',
    color: 'slate',
    bgClass: 'bg-slate-50 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
  };
};

