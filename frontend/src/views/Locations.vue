<template>
  <Layout>
    <div class="px-4 sm:px-0">
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">地点管理</h1>
        <button
          @click="openCreateModal"
          class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          添加地点
        </button>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <div class="min-w-[500px]">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">名称</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">描述</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">创建时间</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="location in locations" :key="location.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900 dark:text-white">{{ location.name }}</td>
              <td class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">{{ location.description || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-300">{{ formatDate(location.created_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <router-link :to="`/locations/${location.id}`" class="px-2 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-xs sm:text-sm">查看</router-link>
                  <button @click="editLocation(location)" class="px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs sm:text-sm">编辑</button>
                  <button @click="showPrintSettings(location)" class="px-2 py-1 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-xs sm:text-sm">打印</button>
                  <button v-if="authStore.isAdmin" @click="deleteLocation(location.id)" class="px-2 py-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-xs sm:text-sm">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        </div>
      </div>

      <!-- 添加/编辑地点弹窗 -->
      <div v-if="showModal" :key="modalKey" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
        <div id="location-modal" class="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white" @click.stop>
          <h3 class="text-lg font-medium mb-4">{{ editingLocation ? '编辑地点' : '添加地点' }}</h3>
          <form @submit.prevent="saveLocation" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">名称 *</label>
              <input v-model="form.name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">描述</label>
              <textarea v-model="form.description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"></textarea>
            </div>
            <div class="flex justify-end space-x-3 mt-4">
              <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">取消</button>
              <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600">保存</button>
            </div>
          </form>
        </div>
      </div>

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
