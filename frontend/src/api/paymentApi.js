import axiosClient from './axiosClient';

export const paymentApi = {
  getPaymentInfo: (bookingId) => axiosClient.get(`/payments/${bookingId}`).then((res) => res.data),
  payBooking: (bookingId) => axiosClient.post(`/payments/${bookingId}/pay`).then((res) => res.data),
};

export default paymentApi;

