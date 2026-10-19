import axiosClient from './axiosClient';

export const bookingApi = {
  getBookings: (params) => axiosClient.get('/bookings', { params }).then((res) => res.data),
  getMarketBookings: () => axiosClient.get('/bookings/market').then((res) => res.data),
  getBookingById: (id) => axiosClient.get(`/bookings/${id}`).then((res) => res.data),
  createBooking: (data) => axiosClient.post('/bookings', data).then((res) => res.data),
  acceptBooking: (id, data = {}) => axiosClient.put(`/bookings/${id}/accept`, data).then((res) => res.data),
  startBooking: (id) => axiosClient.put(`/bookings/${id}/start`).then((res) => res.data),
  completeBooking: (id, formDataOrData) => {
    const isFormData = typeof FormData !== 'undefined' && formDataOrData instanceof FormData;
    return axiosClient
      .put(`/bookings/${id}/complete`, formDataOrData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      })
      .then((res) => res.data);
  },
  cancelBooking: (id, data = {}) => axiosClient.put(`/bookings/${id}/cancel`, data).then((res) => res.data),
  updateBookingStatus: (id, status) => axiosClient.put(`/bookings/${id}`, { status }).then((res) => res.data),
};

export default bookingApi;
