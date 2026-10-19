import axiosClient from './axiosClient';

export const workerApi = {
  getWorkers: (params) => axiosClient.get('/workers', { params }).then((res) => res.data),
  getWorkerById: (id) => axiosClient.get(`/workers/${id}`).then((res) => res.data),
};

export default workerApi;

