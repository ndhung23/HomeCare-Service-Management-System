import axiosClient from './axiosClient';

export const serviceApi = {
  getServices: (params) => axiosClient.get('/services', { params }).then((res) => res.data),
  getServiceById: (id) => axiosClient.get(`/services/${id}`).then((res) => res.data),
  createService: (data) => axiosClient.post('/services', data).then((res) => res.data),
  updateService: (id, data) => axiosClient.put(`/services/${id}`, data).then((res) => res.data),
  deleteService: (id) => axiosClient.delete(`/services/${id}`).then((res) => res.data),
  uploadImage: (formData) =>
    axiosClient.post('/services/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data),
};

export default serviceApi;

