import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials).then((res) => res.data),
  register: (userData) => axiosClient.post('/auth/register', userData).then((res) => res.data),
  getMe: () => axiosClient.get('/auth/me').then((res) => res.data),
  getAccounts: () => axiosClient.get('/auth/users').then((res) => res.data),
};

export default authApi;

