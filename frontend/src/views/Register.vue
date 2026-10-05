<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          注册新账号
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="username" class="form-label">用户名</label>
            <input
              id="username"
              v-model="username"
              name="username"
              type="text"
              required
              class="input mt-1"
              placeholder="请输入用户名"
            />
          </div>
          <div>
            <label for="email" class="form-label">邮箱（可选）</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              class="input mt-1"
              placeholder="请输入邮箱"
            />
          </div>
          <div>
            <label for="password" class="form-label">密码</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="input mt-1"
              placeholder="请输入密码"
            />
          </div>
          <div>
            <label for="confirm-password" class="form-label">确认密码</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              name="confirm-password"
              type="password"
              required
              class="input mt-1"
              placeholder="请再次输入密码"
            />
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-300">{{ error }}</h3>
            </div>
          </div>
        </div>

        <div v-if="success" class="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800 dark:text-green-300">{{ success }}</h3>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary w-full"
          >
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </div>

        <div class="text-center">
          <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            已有账号？立即登录
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { settingsApi, authApi } from '../api/modules';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

onMounted(async () => {
  try {
    const settingsRes: any = await settingsApi.getAll();
    const guest = settingsRes.find((s: any) => s.key === 'allow_guest_register');
    const allow = guest ? (guest.value === '1' || guest.value === 'true') : true;
    const countRes: any = await authApi.getUserCount();
    const userCount = countRes.count ?? 0;
    if (!allow && userCount > 0) {
      // 不允许注册且已有用户，跳转到登录
      router.push('/login');
    }
  } catch (err) {
    // ignore
  }
});

const handleRegister = async () => {
  error.value = '';
  success.value = '';

  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致';
    return;
  }

  loading.value = true;

  try {
    await authStore.register(username.value, password.value, email.value);
    success.value = '注册成功！3秒后跳转到登录页面...';
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  } catch (err: any) {
    error.value = err.message || '注册失败';
  } finally {
    loading.value = false;
  }
};
</script>
