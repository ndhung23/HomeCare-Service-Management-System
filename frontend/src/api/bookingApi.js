import axiosClient from './axiosClient';

export const bookingApi = {
  getBookings: (params) => axiosClient.get('/bookings', { params }).then((res) => res.data),
  getBookingById: (id) => axiosClient.get(`/bookings/${id}`).then((res) => res.data),
  createBooking: (data) => axiosClient.post('/bookings', data).then((res) => res.data),
  updateBookingStatus: (id, status) => axiosClient.put(`/bookings/${id}`, { status }).then((res) => res.data),
};

export default bookingApi;

