import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi, type User } from '../api/modules';
import { encryptPassword } from '../utils/crypto';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User & { role?: string } | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isAuthenticated = ref(!!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  // 登录
  const login = async (username: string, password: string) => {
    try {
      // 对密码进行客户端加密
      const encryptedPassword = encryptPassword(password);
      const response = await authApi.login({ username, password: encryptedPassword });
      token.value = response.token;
      user.value = response.user;
      isAuthenticated.value = true;
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '登录失败');
    }
  };

  // 注册
  const register = async (username: string, password: string, email?: string) => {
    try {
      // 对密码进行客户端加密
      const encryptedPassword = encryptPassword(password);
      const response = await authApi.register({ username, password: encryptedPassword, email });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '注册失败');
    }
  };

  // 登出
  const logout = () => {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // 加载当前用户信息
  const loadUser = async () => {
    if (!token.value) return;
    
    try {
      const response = await authApi.getCurrentUser();
      user.value = response;
      isAuthenticated.value = true;
    } catch (error) {
      logout();
    }
  };

  // 初始化时加载用户信息
  const initAuth = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token.value) {
      try {
        user.value = JSON.parse(savedUser);
        isAuthenticated.value = true;
      } catch {
        logout();
      }
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    loadUser,
    initAuth,
  };
});
