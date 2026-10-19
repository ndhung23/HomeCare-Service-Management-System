import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials).then((res) => res.data),
  register: (userData) => axiosClient.post('/auth/register', userData).then((res) => res.data),
  getMe: () => axiosClient.get('/auth/me').then((res) => res.data),
  getAccounts: () => axiosClient.get('/auth/users').then((res) => res.data),
  addEmployee: (employeeData) => axiosClient.post('/auth/employees', employeeData).then((res) => res.data),
  updateProfile: (data) => axiosClient.put('/auth/profile', data).then((res) => res.data),
  changePassword: (data) => axiosClient.put('/auth/change-password', data).then((res) => res.data),
  updateAvailability: (data) => axiosClient.put('/auth/availability', data).then((res) => res.data),
  forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email }).then((res) => res.data),
  resetPassword: (token, data) => axiosClient.post(`/auth/reset-password/${token}`, data).then((res) => res.data),
};

export default authApi;

