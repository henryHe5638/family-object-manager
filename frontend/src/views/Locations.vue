<template>
  <Layout>
    <div class="px-4 sm:px-0">
      <div class="page-header">
        <h1 class="page-title">地点管理</h1>
        <button @click="openCreateModal" class="btn btn-primary">
          添加地点
        </button>
      </div>

      <div class="card">
        <div class="overflow-x-auto">
          <div class="min-w-[500px]">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="th-cell">名称</th>
              <th class="th-cell">描述</th>
              <th class="th-cell">创建时间</th>
              <th class="th-cell">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="location in locations" :key="location.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900 dark:text-white">
                <router-link :to="`/locations/${location.id}`" class="hover:text-blue-600 dark:hover:text-blue-400">
                  {{ location.name }}
                </router-link>
              </td>
              <td class="td-cell">{{ location.description || '-' }}</td>
              <td class="td-cell">{{ formatDate(location.created_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <router-link :to="`/locations/${location.id}`" class="link-btn link-primary">查看</router-link>
                  <button @click="editLocation(location)" class="link-btn link-neutral">编辑</button>
                  <button @click="showPrintSettings(location)" class="link-btn link-success">打印</button>
                  <button v-if="authStore.isAdmin" @click="deleteLocation(location.id)" class="link-btn link-danger">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        </div>
      </div>

      <!-- 添加/编辑地点弹窗 -->
      <BaseModal
        :show="showModal"
        :key="modalKey"
        :title="editingLocation ? '编辑地点' : '添加地点'"
        max-width="max-w-md"
        @close="closeModal"
      >
        <form id="location-modal" @submit.prevent="saveLocation" class="space-y-4">
          <div>
            <label class="form-label">名称 *</label>
            <input v-model="form.name" required class="input mt-1">
          </div>
          <div>
            <label class="form-label">描述</label>
            <textarea v-model="form.description" rows="3" class="input mt-1"></textarea>
          </div>
          <div class="flex justify-end space-x-3 mt-4">
            <button type="button" @click="closeModal" class="btn btn-secondary">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </BaseModal>

      <!-- 确认删除对话框 -->
      <ConfirmDialog
        ref="confirmDialog"
        title="删除地点"
        message="确定要删除这个地点吗？删除后无法恢复。"
        type="danger"
        @confirm="confirmDelete"
      />
      
      <!-- 打印设置模态框 -->
      <PrintQRModal 
        :visible="printModalVisible"
        :qr-code-image="selectedLocationQRCode"
        :title="selectedLocationName"
        @close="closePrintModal"
      />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue';
import Layout from '../components/Layout.vue';
import BaseModal from '../components/BaseModal.vue';
import { locationApi } from '../api/modules';
import { useAuthStore } from '../stores/auth';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import PrintQRModal from '../components/PrintQRModal.vue';

const authStore = useAuthStore();

const locations = ref<any[]>([]);
const showModal = ref(false);
const editingLocation = ref<any>(null);
const modalKey = ref(0); // 用于强制重渲染弹窗
const confirmDialog = ref<InstanceType<typeof ConfirmDialog>>();
const deletingLocationId = ref<number | null>(null);
const printModalVisible = ref(false);
const selectedLocationQRCode = ref('');
const selectedLocationName = ref('');

const form = reactive({
  name: '',
  description: '',
});

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
};

const loadLocations = async () => {
  try {
    const response = await locationApi.getAll();
    locations.value = response.data || response;
  } catch (error) {
    console.error('加载地点失败:', error);
  }
};

const resetForm = () => {
  form.name = '';
  form.description = '';
};

const openCreateModal = async () => {
  resetForm();
  editingLocation.value = null;
  modalKey.value++; // 强制重渲染弹窗
  showModal.value = true;
  // 强制触发响应式更新
  await nextTick();
  // 确保弹窗DOM元素获得焦点
  setTimeout(() => {
    const firstInput = document.querySelector('#location-modal input');
    if (firstInput) {
      (firstInput as HTMLInputElement).focus();
    }
  }, 50);
};

const closeModal = () => {
  showModal.value = false;
  editingLocation.value = null;
  resetForm();
};

const editLocation = (location: any) => {
  editingLocation.value = location;
  Object.assign(form, {
    name: location.name,
    description: location.description,
  });
  showModal.value = true;
};

const saveLocation = async () => {
  try {
    if (editingLocation.value) {
      await locationApi.update(editingLocation.value.id, form);
    } else {
      await locationApi.create(form);
    }
    await loadLocations();
    closeModal();
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败');
  }
};

const deleteLocation = (id: number) => {
  deletingLocationId.value = id;
  confirmDialog.value?.show();
};

const confirmDelete = async () => {
  if (!deletingLocationId.value) return;
  
  try {
    await locationApi.delete(deletingLocationId.value);
    await loadLocations();
    deletingLocationId.value = null;
  } catch (error) {
    console.error('删除失败:', error);
    alert('删除失败');
  }
};

const showPrintSettings = async (location: any) => {
  try {
    const url = location.qrCode || `${window.location.origin}/location/${location.id}`;
    const canvas = document.createElement('canvas');
    const qrcode = (await import('qrcode')).default;
    await qrcode.toCanvas(canvas, url);
    selectedLocationQRCode.value = canvas.toDataURL();
    selectedLocationName.value = location.name;
    printModalVisible.value = true;
  } catch (error) {
    console.error('生成二维码错误:', error);
  }
};

const closePrintModal = () => {
  printModalVisible.value = false;
};

onMounted(() => {
  loadLocations();
});
</script>
