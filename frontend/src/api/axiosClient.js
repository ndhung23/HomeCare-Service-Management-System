import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gắn JWT token vào Authorization header cho mọi request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('giupviec24_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý response lỗi xác thực (401)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthUrl = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthUrl) {
        localStorage.removeItem('giupviec24_token');
        localStorage.removeItem('giupviec24_user');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;