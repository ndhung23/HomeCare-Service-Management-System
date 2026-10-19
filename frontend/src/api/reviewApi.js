import axiosClient from './axiosClient';

export const reviewApi = {
  getReviews: () => axiosClient.get('/reviews').then((res) => res.data),
  createReview: (data) => axiosClient.post('/reviews', data).then((res) => res.data),
};

export default reviewApi;

