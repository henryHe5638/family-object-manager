import api from './index';

export interface User {
  id: number;
  username: string;
  email?: string;
  created_at: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData extends LoginData {
  email?: string;
}

export const authApi = {
  // 登录
  login: (data: LoginData) => api.post('/users/login', data),
  
  // 注册
  register: (data: RegisterData) => api.post('/users/register', data),
  
  // 获取当前用户信息
  getCurrentUser: () => api.get('/users/me'),
  
  // 修改自己的密码
  changePassword: (data: { oldPassword: string; newPassword: string }) => api.put('/users/change-password', data),
  
  // 获取所有用户
  getUsers: () => api.get('/users'),
  
  // 创建用户（管理员）
  createUser: (data: { username: string; password: string; email?: string; role?: string }) => api.post('/users', data),

  // 更新用户（管理员）
  updateUser: (id: number, data: { role?: string; email?: string; password?: string; disabled?: boolean }) => api.put(`/users/${id}`, data),

  // 获取用户数量（公开）
  getUserCount: () => api.get('/users/count'),
  
  // 删除用户
  deleteUser: (id: number) => api.delete(`/users/${id}`),
};

export const locationApi = {
  getAll: () => api.get('/locations'),
  getById: (id: number) => api.get(`/locations/${id}`),
  create: (data: any) => api.post('/locations', data),
  update: (id: number, data: any) => api.put(`/locations/${id}`, data),
  delete: (id: number) => api.delete(`/locations/${id}`),
};

export const categoryApi = {
  // 两级类目API
  getGroups: () => api.get('/categories/groups'),
  getGroupItems: (groupId: number) => api.get(`/categories/groups/${groupId}/items`),
  getAllItems: () => api.get('/categories/items'),
  searchItems: (q: string) => api.get(`/categories/items/search?q=${q}`),
  createGroup: (data: any) => api.post('/categories/groups', data),
  createItem: (data: any) => api.post('/categories/items', data),
  updateGroup: (id: number, data: any) => api.put(`/categories/groups/${id}`, data),
  updateItem: (id: number, data: any) => api.put(`/categories/items/${id}`, data),
  deleteGroup: (id: number) => api.delete(`/categories/groups/${id}`),
  deleteItem: (id: number) => api.delete(`/categories/items/${id}`),
};

export const settingsApi = {
  getAll: () => api.get('/settings'),
  get: (key: string) => api.get(`/settings/${key}`),
  update: (key: string, data: { value: string }) => api.put(`/settings/${key}`, data),
  batchUpdate: (settings: Record<string, string>) => api.post('/settings/batch', settings),
  exportDatabase: () => api.get('/settings/export-database', { responseType: 'blob' }),
  importDatabase: (file: File) => {
    const formData = new FormData();
    formData.append('database', file);
    return api.post('/settings/import-database', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  resetDatabase: () => api.post('/settings/reset-database'),
};

export const drawerApi = {
  getAll: () => api.get('/drawers'),
  getById: (id: number) => api.get(`/drawers/${id}`),
  getByQRCode: (qrCode: string) => api.get(`/drawers/qr/${qrCode}`),
  getQRCode: (id: number) => api.get(`/drawers/${id}/qrcode`),
  create: (data: any) => api.post('/drawers', data),
  update: (id: number, data: any) => api.put(`/drawers/${id}`, data),
  delete: (id: number) => api.delete(`/drawers/${id}`),
  regenerateQR: (id: number) => api.post(`/drawers/${id}/regenerate-qr`),
};

export const itemApi = {
  getAll: () => api.get('/items'),
  getById: (id: number) => api.get(`/items/${id}`),
  getExpiring: (days: number = 30) => api.get(`/items/expiring?days=${days}`),
  getExpired: () => api.get('/items/expired'),
  getQRCode: (id: number) => api.get(`/items/${id}/qrcode`),
  getByQRCode: (qrCode: string) => api.get(`/items/qr/${qrCode}`),
  create: (data: any) => api.post('/items', data),
  update: (id: number, data: any) => api.put(`/items/${id}`, data),
  delete: (id: number) => api.delete(`/items/${id}`),
};

export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
