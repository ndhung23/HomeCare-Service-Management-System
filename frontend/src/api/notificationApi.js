import axiosClient from './axiosClient';

export const notificationApi = {
  getNotifications: () => axiosClient.get('/notifications').then((res) => res.data),
  markAsRead: (id = 'all') => axiosClient.put(`/notifications/${id}/read`).then((res) => res.data),
};

export default notificationApi;

