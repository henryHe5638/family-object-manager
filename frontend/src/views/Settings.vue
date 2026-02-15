<template>
  <Layout>
    <div class="px-4 sm:px-0">
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">系统设置</h1>
      </div>

      <div class="mt-8 space-y-6">
        <!-- 游客注册设置 -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">允许游客注册</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">开启后，新用户可以自行注册账号</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only" :checked="allowGuestRegister" @change="toggleGuestRegister" />
              <span :class="['w-11 h-6 rounded-full transition-colors duration-200', allowGuestRegister ? 'bg-blue-600' : 'bg-gray-200']"></span>
              <span :class="['absolute left-0 top-0 mt-0.5 ml-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200', allowGuestRegister ? 'translate-x-5' : 'translate-x-0']"></span>
            </label>
          </div>
        </div>

        <!-- 网站地址设置 -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div>
            <label for="site_url" class="block text-lg font-medium text-gray-900 dark:text-white">网站地址</label>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 mb-4">用于生成二维码跳转链接，请填写完整的网址（如: https://example.com）</p>
            <div class="mt-2 flex gap-3">
              <input
                id="site_url"
                v-model="siteUrl"
                type="url"
                placeholder="https://example.com"
                class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
              <button
                @click="saveSiteUrl"
                class="inline-flex items-center rounded-md bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 dark:hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>

        <!-- 修改密码 -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">修改密码</h3>
          <form @submit.prevent="changePassword" class="space-y-4">
            <div>
              <label for="old_password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">当前密码</label>
              <input
                id="old_password"
                v-model="passwordForm.oldPassword"
                type="password"
                required
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label for="new_password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">新密码</label>
              <input
                id="new_password"
                v-model="passwordForm.newPassword"
                type="password"
                required
                minlength="6"
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">密码长度至少 6 位</p>
            </div>
            <div>
              <label for="confirm_password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">确认新密码</label>
              <input
                id="confirm_password"
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                修改密码
              </button>
            </div>
          </form>
        </div>

        <!-- 保存提示 -->
        <div v-if="saveMessage" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800">{{ saveMessage }}</p>
            </div>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- 数据管理 -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">数据管理</h3>
          <div class="space-y-4">
            <!-- 导出数据 -->
            <div class="pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">导出数据库</h4>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">导出完整的数据库文件作为备份</p>
              </div>
              <button
                @click="exportDatabase"
                :disabled="isExporting"
                class="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="isExporting" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isExporting ? '导出中...' : '导出数据库' }}
              </button>
            </div>

            <!-- 导入数据 -->
            <div class="pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">导入数据库</h4>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">从备份文件恢复数据，上传后需手动重启后端服务器</p>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept=".db,.sqlite"
                @change="importDatabase"
                class="hidden"
              />
              <button
                @click="triggerFileInput"
                :disabled="isImporting"
                class="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="isImporting" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isImporting ? '导入中...' : '导入数据库' }}
              </button>
            </div>

            <!-- 重置数据库 -->
            <div class="pt-2">
              <div>
                <h4 class="text-sm font-medium text-red-600 dark:text-red-400">重置数据库</h4>
                <p class="mt-1 text-sm text-red-500 dark:text-red-400">⚠️ 危险操作：将删除所有数据，此操作不可恢复</p>
              </div>
              <button
                @click="showResetConfirm"
                class="mt-3 inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                重置数据库
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 重置确认对话框 -->
      <div v-if="showResetDialog" class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50" @click="closeResetDialog">
        <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800" @click.stop>
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
              <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="mt-5 text-lg font-medium text-gray-900 dark:text-white">确认重置数据库？</h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500 dark:text-gray-400">此操作将删除所有物品、抽屉、地点和类目数据，且无法恢复。</p>
              <p class="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">请在下方输入"确认重置"以继续</p>
              <input
                v-model="resetConfirmText"
                type="text"
                placeholder="输入：确认重置"
                class="mt-3 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <div class="flex gap-3 px-4 py-3">
              <button
                @click="closeResetDialog"
                class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                取消
              </button>
              <button
                @click="confirmReset"
                :disabled="resetConfirmText !== '确认重置' || isResetting"
                class="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isResetting ? '重置中...' : '确认重置' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import Layout from '../components/Layout.vue';
import { settingsApi, authApi } from '../api/modules';
import axios from 'axios';

const allowGuestRegister = ref(false);
const siteUrl = ref('');
const saveMessage = ref('');
const errorMessage = ref('');
const isExporting = ref(false);
const isImporting = ref(false);
const isResetting = ref(false);
const showResetDialog = ref(false);
const resetConfirmText = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const loadSettings = async () => {
  try {
    const settings = await settingsApi.getAll();
    const data = settings.data || settings;
    const guestRegisterSetting = data.find((s: any) => s.key === 'allow_guest_register');
    const siteUrlSetting = data.find((s: any) => s.key === 'site_url');
    
    allowGuestRegister.value = guestRegisterSetting?.value === '1' || guestRegisterSetting?.value === 'true';
    siteUrl.value = siteUrlSetting?.value || '';
  } catch (error: any) {
    console.error('加载设置失败:', error);
    errorMessage.value = error.response?.data?.error || '加载设置失败';
    setTimeout(() => errorMessage.value = '', 3000);
  }
};

const toggleGuestRegister = async () => {
  try {
    const newValue = !allowGuestRegister.value;
    await settingsApi.update('allow_guest_register', { value: newValue ? '1' : '0' });
    allowGuestRegister.value = newValue;
    
    saveMessage.value = '设置已保存';
    setTimeout(() => saveMessage.value = '', 3000);
  } catch (error: any) {
    console.error('保存设置失败:', error);
    errorMessage.value = error.response?.data?.error || '保存设置失败';
    setTimeout(() => errorMessage.value = '', 3000);
  }
};

const saveSiteUrl = async () => {
  try {
    if (!siteUrl.value) {
      errorMessage.value = '请输入网站地址';
      setTimeout(() => errorMessage.value = '', 3000);
      return;
    }
    
    // 验证URL格式
    try {
      new URL(siteUrl.value);
    } catch {
      errorMessage.value = '请输入有效的网址（如: https://example.com）';
      setTimeout(() => errorMessage.value = '', 3000);
      return;
    }
    
    await settingsApi.update('site_url', { value: siteUrl.value });
    
    saveMessage.value = '网站地址已保存';
    setTimeout(() => saveMessage.value = '', 3000);
  } catch (error: any) {
    console.error('保存网站地址失败:', error);
    errorMessage.value = error.response?.data?.error || '保存网站地址失败';
    setTimeout(() => errorMessage.value = '', 3000);
  }
};

const changePassword = async () => {
  try {
    // 验证新密码和确认密码是否一致
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errorMessage.value = '两次输入的新密码不一致';
      setTimeout(() => errorMessage.value = '', 3000);
      return;
    }

    // 调用修改密码API
    await authApi.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });
    
    // 重置表单
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    
    saveMessage.value = '密码修改成功';
    setTimeout(() => saveMessage.value = '', 3000);
  } catch (error: any) {
    console.error('修改密码失败:', error);
    errorMessage.value = error.response?.data?.error || '修改密码失败';
    setTimeout(() => errorMessage.value = '', 3000);
  }
};

// 导出数据库
const exportDatabase = async () => {
  try {
    isExporting.value = true;
    const response = await settingsApi.exportDatabase();

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response as any]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `family-manager-backup-${new Date().toISOString().split('T')[0]}.db`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    saveMessage.value = '数据库导出成功';
    setTimeout(() => saveMessage.value = '', 3000);
  } catch (error: any) {
    console.error('导出数据库失败:', error);
    errorMessage.value = error.response?.data?.error || '导出数据库失败';
    setTimeout(() => errorMessage.value = '', 3000);
  } finally {
    isExporting.value = false;
  }
};

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click();
};

// 导入数据库
const importDatabase = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  // 验证文件类型
  if (!file.name.endsWith('.db') && !file.name.endsWith('.sqlite')) {
    errorMessage.value = '请选择有效的数据库文件 (.db 或 .sqlite)';
    setTimeout(() => errorMessage.value = '', 3000);
    target.value = '';
    return;
  }

  try {
    isImporting.value = true;
    const result = await settingsApi.importDatabase(file);
    
    saveMessage.value = '数据库文件已上传并备份，请手动重启后端服务器以应用更改';
    
    // 不自动刷新页面，等待用户手动重启服务器
  } catch (error: any) {
    console.error('导入数据库失败:', error);
    errorMessage.value = error.response?.data?.error || '导入数据库失败';
    setTimeout(() => errorMessage.value = '', 3000);
  } finally {
    isImporting.value = false;
    target.value = '';
  }
};

// 显示重置确认对话框
const showResetConfirm = () => {
  showResetDialog.value = true;
  resetConfirmText.value = '';
};

// 关闭重置对话框
const closeResetDialog = () => {
  showResetDialog.value = false;
  resetConfirmText.value = '';
};

// 确认重置
const confirmReset = async () => {
  if (resetConfirmText.value !== '确认重置') {
    return;
  }

  try {
    isResetting.value = true;
    await axios.post(
      'http://localhost:3000/api/settings/reset-database',
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    saveMessage.value = '数据库已重置，页面将在3秒后刷新';
    setTimeout(() => {
      window.location.reload();
    }, 3000);
    closeResetDialog();
  } catch (error: any) {
    console.error('重置数据库失败:', error);
    errorMessage.value = error.response?.data?.error || '重置数据库失败';
    setTimeout(() => errorMessage.value = '', 3000);
  } finally {
    isResetting.value = false;
  }
};

onMounted(() => {
  loadSettings();
});
</script>
