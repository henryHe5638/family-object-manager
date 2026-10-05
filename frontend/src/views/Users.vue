<template>
  <Layout>
    <div class="px-4 sm:px-0">
      <div class="page-header">
        <h1 class="page-title">用户管理</h1>
        <button
          @click="showCreate = true"
          class="btn btn-primary"
        >
          创建用户
        </button>
      </div>

      <div class="card">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="th-cell">用户名</th>
              <th class="th-cell">邮箱</th>
              <th class="th-cell">状态</th>
              <th class="th-cell">创建时间</th>
              <th class="th-cell">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ user.username }}
                <span v-if="user.id === currentUserId" class="ml-2 text-xs text-blue-600 dark:text-blue-400">(当前用户)</span>
              </td>
              <td class="td-cell">{{ user.email || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span :class="['badge', user.disabled ? 'badge-red' : 'badge-green']">
                  {{ user.disabled ? '已停用' : '正常' }}
                </span>
              </td>
              <td class="td-cell">{{ formatDate(user.created_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                <div class="flex items-center justify-center space-x-3">
                  <select v-model="user.role" @change="updateRole(user)" class="input-inline">
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                  <button
                    v-if="user.id !== currentUserId"
                    @click="toggleUserStatus(user)"
                    :class="['btn btn-sm', user.disabled ? 'btn-success' : 'btn-warning']"
                  >
                    {{ user.disabled ? '启用' : '停用' }}
                  </button>
                  <button
                    v-if="user.id !== currentUserId"
                    @click="deleteUser(user.id)"
                    class="link-btn link-danger"
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
      <BaseModal
        :show="showCreate"
        title="创建用户"
        max-width="max-w-md"
        @close="showCreate = false"
      >
        <form @submit.prevent="createUser" class="space-y-4">
          <div>
            <label class="form-label">用户名 *</label>
            <input v-model="newUser.username" required class="input mt-1">
          </div>
          <div>
            <label class="form-label">邮箱</label>
            <input v-model="newUser.email" class="input mt-1">
          </div>
          <div>
            <label class="form-label">密码 *</label>
            <input v-model="newUser.password" type="password" required class="input mt-1">
          </div>
          <div>
            <label class="form-label">角色</label>
            <select v-model="newUser.role" class="input mt-1">
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div class="flex justify-end space-x-3 mt-4">
            <button type="button" @click="showCreate = false" class="btn btn-secondary">取消</button>
            <button type="submit" class="btn btn-primary">创建</button>
          </div>
        </form>
      </BaseModal>

      <div class="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p class="text-sm text-blue-800 dark:text-blue-200">
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
import BaseModal from '../components/BaseModal.vue';
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
