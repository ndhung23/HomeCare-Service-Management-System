import axiosClient from './axiosClient';

export const newsApi = {
  getNews: () => axiosClient.get('/news').then((res) => res.data),
};

export default newsApi;

