import axiosClient from './axiosClient';

export const disputeApi = {
  createDispute: (data) => axiosClient.post('/disputes', data).then((res) => res.data),
  getDisputes: () => axiosClient.get('/disputes').then((res) => res.data),
  resolveDispute: (id, data) => axiosClient.put(`/disputes/${id}/resolve`, data).then((res) => res.data),
};

export default disputeApi;

