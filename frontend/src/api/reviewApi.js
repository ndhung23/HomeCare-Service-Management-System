import axiosClient from './axiosClient';

export const reviewApi = {
  getReviews: (params) => axiosClient.get('/reviews', { params }).then((res) => res.data),
  createReview: (data) => axiosClient.post('/reviews', data).then((res) => res.data),
  updateReview: (id, data) => axiosClient.put(`/reviews/${id}`, data).then((res) => res.data),
};

export default reviewApi;

