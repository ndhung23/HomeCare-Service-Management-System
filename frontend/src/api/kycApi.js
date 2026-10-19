import axiosClient from './axiosClient';

export const kycApi = {
  getKycStatus: () => axiosClient.get('/kyc/status').then((res) => res.data),
  submitKyc: (formData) =>
    axiosClient
      .post('/kyc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),
};

export default kycApi;

