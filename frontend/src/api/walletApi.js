import axiosClient from './axiosClient';

export const walletApi = {
  getMyWallet: () => axiosClient.get('/wallet/me').then((res) => res.data),
  updateBank: (data) => axiosClient.put('/wallet/bank', data).then((res) => res.data),
  requestWithdraw: (data) => axiosClient.post('/wallet/withdraw', data).then((res) => res.data),
};

export default walletApi;

