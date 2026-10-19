import axiosClient from './axiosClient';

export const adminApi = {
  getStats: () => axiosClient.get('/admin/stats').then((res) => res.data),
  getUsers: (params) => axiosClient.get('/admin/users', { params }).then((res) => res.data),
  toggleLockUser: (userId, reason) => axiosClient.put(`/admin/users/${userId}/lock`, { reason }).then((res) => res.data),
  getPendingKyc: () => axiosClient.get('/admin/kyc/pending').then((res) => res.data),
  approveKyc: (userId) => axiosClient.put(`/admin/kyc/${userId}/approve`).then((res) => res.data),
  rejectKyc: (userId, reason) => axiosClient.put(`/admin/kyc/${userId}/reject`, { reason }).then((res) => res.data),
  confirmPayment: (bookingId) => axiosClient.put(`/admin/bookings/${bookingId}/confirm-payment`).then((res) => res.data),
  rejectPayment: (bookingId, reason) => axiosClient.put(`/admin/bookings/${bookingId}/reject-payment`, { reason }).then((res) => res.data),
  getPayments: (params) => axiosClient.get('/admin/payments', { params }).then((res) => res.data),
  getWithdraws: (params) => axiosClient.get('/admin/withdraws', { params }).then((res) => res.data),
  approveWithdraw: (withdrawId) => axiosClient.put(`/admin/withdraws/${withdrawId}/approve`).then((res) => res.data),
  rejectWithdraw: (withdrawId, reason) => axiosClient.put(`/admin/withdraws/${withdrawId}/reject`, { reason }).then((res) => res.data),
};

export default adminApi;

