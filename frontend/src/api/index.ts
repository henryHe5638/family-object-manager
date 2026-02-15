import axios from 'axios';

const getDefaultApiUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:3000/api';
};

const envApiUrl = import.meta.env.VITE_API_URL;
const runtimeApiUrl = getDefaultApiUrl();
const shouldUseRuntime =
  typeof window !== 'undefined' &&
  !!envApiUrl &&
  envApiUrl.includes('localhost') &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

const API_URL = shouldUseRuntime
  ? runtimeApiUrl
  : envApiUrl || runtimeApiUrl;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误和返回数据
api.interceptors.response.use(
  (response) => {
    // 如果是 blob 类型，直接返回完整响应的 data
    if (response.config.responseType === 'blob') {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
