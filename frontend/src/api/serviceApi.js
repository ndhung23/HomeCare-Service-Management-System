import axiosClient from './axiosClient';

export const serviceApi = {
  getServices: (params) => axiosClient.get('/services', { params }).then((res) => res.data),
  getServiceById: (id) => axiosClient.get(`/services/${id}`).then((res) => res.data),
};

export default serviceApi;

