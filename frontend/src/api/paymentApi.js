import axiosClient from './axiosClient';

export const paymentApi = {
  getPaymentInfo: (bookingId) => axiosClient.get(`/payments/${bookingId}`).then((res) => res.data),
};

export default paymentApi;

