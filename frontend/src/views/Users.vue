<template>
  <Layout>
    <div class="px-4 sm:px-0">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">用户管理</h1>

      <div class="sm:flex sm:items-center sm:justify-between mb-4">
        <div></div>
        <button
          @click="showCreate = true"
          class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          创建用户
        </button>
      </div>

      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ user.username }}
                <span v-if="user.id === currentUserId" class="ml-2 text-xs text-blue-600">(当前用户)</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 py-1 text-xs font-semibold rounded-full', user.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800']">
                  {{ user.disabled ? '已停用' : '正常' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(user.created_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-3">
                  <select v-model="user.role" @change="updateRole(user)" class="px-2 py-1 border rounded text-sm">
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                  <button
                    v-if="user.id !== currentUserId"
                    @click="toggleUserStatus(user)"
                    :class="['px-2 py-1 text-xs font-medium rounded', user.disabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200']"
                  >
                    {{ user.disabled ? '启用' : '停用' }}
                  </button>
                  <button
                    v-if="user.id !== currentUserId"
                    @click="deleteUser(user.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 创建用户弹窗 -->
      <div v-if="showCreate" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="showCreate = false">
        <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800" @click.stop>
          <h3 class="text-lg font-medium mb-4 text-gray-900 dark:text-white">创建用户</h3>
          <form @submit.prevent="createUser" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">用户名 *</label>
              <input v-model="newUser.username" required class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">邮箱</label>
              <input v-model="newUser.email" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">密码 *</label>
              <input v-model="newUser.password" type="password" required class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">角色</label>
              <select v-model="newUser.role" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div class="flex justify-end space-x-3 mt-4">
              <button type="button" @click="showCreate = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">取消</button>
              <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600">创建</button>
            </div>
          </form>
        </div>
      </div>

      <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p class="text-sm text-blue-800">
          提示：新用户可以通过注册页面自行注册账号。当前登录用户无法删除自己的账号。
        </p>
      </div>

      <!-- 确认删除对话框 -->
      <ConfirmDialog
        ref="confirmDialog"
        title="删除用户"
        message="确定要删除这个用户吗？删除后无法恢复。"
        type="danger"
        @confirm="confirmDelete"
      />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Layout from '../components/Layout.vue';
import { authApi } from '../api/modules';
import { useAuthStore } from '../stores/auth';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { encryptPassword } from '../utils/crypto';

const authStore = useAuthStore();
const users = ref<any[]>([]);
const confirmDialog = ref<InstanceType<typeof ConfirmDialog>>();
const deletingUserId = ref<number | null>(null);

const currentUserId = computed(() => authStore.user?.id);

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
};

const loadUsers = async () => {
  try {
    const response = await authApi.getUsers();
    users.value = response.data || response;
  } catch (error) {
    console.error('加载用户列表失败:', error);
  }
};

const deleteUser = (id: number) => {
  deletingUserId.value = id;
  confirmDialog.value?.show();
};

const confirmDelete = async () => {
  if (!deletingUserId.value) return;
  
  try {
    await authApi.deleteUser(deletingUserId.value);
    await loadUsers();
    deletingUserId.value = null;
  } catch (error) {
    console.error('删除用户失败:', error);
    alert('删除用户失败');
  }
};

const toggleUserStatus = async (user: any) => {
  try {
    const newDisabled = !user.disabled;
    await authApi.updateUser(user.id, { disabled: newDisabled });
    await loadUsers();
  } catch (error) {
    console.error('更新用户状态失败:', error);
    alert('更新用户状态失败');
  }
};

const showCreate = ref(false);
const newUser = ref({ username: '', email: '', password: '', role: 'user' });

const createUser = async () => {
  try {
    // 对密码进行客户端加密
    const userData = {
      ...newUser.value,
      password: encryptPassword(newUser.value.password)
    };
    await authApi.createUser(userData);
    showCreate.value = false;
    newUser.value = { username: '', email: '', password: '', role: 'user' };
    await loadUsers();
  } catch (error) {
    console.error('创建用户失败:', error);
    alert('创建用户失败');
  }
};

const updateRole = async (user: any) => {
  try {
    await authApi.updateUser(user.id, { role: user.role });
    await loadUsers();
  } catch (error) {
    console.error('更新用户角色失败:', error);
    alert('更新用户失败');
  }
};

onMounted(() => {
  loadUsers();
});
</script>
