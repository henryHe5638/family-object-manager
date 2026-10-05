<template>
  <Layout>
    <div class="px-4 sm:px-0">
      <router-link to="/drawers" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 inline-block">
        ← 返回抽屉列表
      </router-link>

      <div v-if="drawer" class="card p-6 mb-6">
        <div class="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <!-- 抽屉图片 -->
          <div class="sm:w-56 shrink-0">
            <div class="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                v-if="drawer.image_data || drawer.image_url"
                :src="getImageUrl(drawer.image_url, drawer.image_data)"
                :alt="drawer.name"
                class="max-w-full max-h-full object-contain"
              />
              <svg v-else class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <!-- 抽屉信息 -->
          <div class="flex-1 min-w-0 flex flex-col">
            <div class="flex justify-between items-start gap-4">
              <div class="min-w-0">
                <h1 class="page-title">{{ drawer.name }}</h1>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ drawer.description || '无描述' }}</p>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">地点: {{ drawer.location_name || '无' }}</p>
              </div>
              <button @click="openQR" class="btn btn-secondary btn-sm shrink-0">抽屉二维码</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">抽屉中的物品</h2>
          <button
            @click="openAddItemModal"
            class="btn btn-primary"
          >
            + 添加物品
          </button>
        </div>
        
        <div v-if="items.length > 0" class="space-y-3">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <router-link :to="`/items/${item.id}`" class="shrink-0">
              <img
                v-if="item.image_data || item.image_url"
                :src="getImageUrl(item.image_url, item.image_data)"
                :alt="item.name"
                title="点击查看详情"
                class="h-14 w-14 object-contain rounded bg-white dark:bg-gray-600"
              />
              <div v-else class="h-14 w-14 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                <svg class="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </router-link>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <router-link
                  :to="`/items/${item.id}`"
                  class="font-medium text-sm text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {{ item.name }}
                </router-link>
                <span class="badge shrink-0" :class="getStatusMeta(item).badgeClass">
                  {{ getStatusMeta(item).text }}
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {{ [item.category_name, item.brand, item.size].filter(Boolean).join(' · ') || '-' }}
              </p>
              <p class="text-xs mt-0.5">
                <span class="text-gray-600 dark:text-gray-400">x{{ item.quantity }}</span>
                <span v-if="item.purchase_price" class="text-blue-600 dark:text-blue-400 ml-2">¥{{ item.purchase_price }}</span>
                <span v-if="item.expiry_date" class="ml-2" :class="getExpiryClass(item.expiry_date)">
                  到期 {{ item.expiry_date }}
                </span>
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                @click="openEditItemModal(item)"
                class="btn btn-secondary btn-sm"
              >
                编辑
              </button>
              <button
                @click="deleteItem(item.id)"
                class="btn btn-danger btn-sm"
              >
                删除
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
          此抽屉中暂无物品
        </div>
      </div>

      <!-- 二维码弹窗 -->
      <BaseModal
        :show="showQR"
        :title="`${drawer?.name} 的二维码`"
        max-width="max-w-md"
        @close="showQR = false"
      >
        <div class="text-center">
          <div v-if="qrLoading" class="py-8 text-gray-400">二维码加载中...</div>
          <img v-else-if="qrCodeImage" :src="qrCodeImage" alt="QR Code" class="mx-auto mb-4">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">扫描二维码访问抽屉</p>
          <div class="flex justify-center gap-2 flex-wrap">
            <button
              @click="downloadQR"
              :disabled="!qrCodeImage"
              class="btn btn-primary"
            >
              下载二维码
            </button>
            <button
              @click="printQR"
              :disabled="!qrCodeImage"
              class="btn btn-secondary"
            >
              打印
            </button>
            <button
              @click="showQR = false"
              class="btn btn-secondary"
            >
              关闭
            </button>
          </div>
        </div>
      </BaseModal>

      <!-- 添加/编辑物品弹窗（共享组件，锁定到当前抽屉） -->
      <ItemFormModal
        :show="showItemModal"
        :item="editingItem"
        :fixed-drawer-id="Number(route.params.id)"
        :fixed-location-id="drawer?.location_id || null"
        @close="closeItemModal"
        @saved="loadDrawer"
      />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Layout from '../components/Layout.vue';
import BaseModal from '../components/BaseModal.vue';
import ItemFormModal from '../components/ItemFormModal.vue';
import { drawerApi, itemApi } from '../api/modules';

const route = useRoute();
const drawer = ref<any>(null);
const items = ref<any[]>([]);
const showQR = ref(false);
const qrCodeImage = ref('');
const qrLoading = ref(false);

// 物品状态展示配置
const STATUS_META: Record<string, { text: string; badgeClass: string }> = {
  stored: { text: '在库', badgeClass: 'badge-gray' },
  in_use: { text: '使用中', badgeClass: 'badge-green' },
  discarded: { text: '已丢弃', badgeClass: 'badge-red' },
};

const getStatusMeta = (item: any): { text: string; badgeClass: string } => {
  return STATUS_META[item.status || 'stored'] || STATUS_META.stored!;
};

// 获取图片完整 URL
const getImageUrl = (imageUrl: string, imageData?: string) => {
  if (imageData && imageData.startsWith('data:')) return imageData;
  if (!imageUrl) return '';
  if (imageUrl.startsWith('data:')) return imageUrl;
  if (imageUrl.startsWith('http')) return imageUrl;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const shouldUseRuntime =
    typeof window !== 'undefined' &&
    !import.meta.env.VITE_API_URL &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';
  const runtimeBase = typeof window !== 'undefined' ? window.location.origin : '';
  const baseUrl = shouldUseRuntime ? runtimeBase : apiUrl.replace('/api', '');
  return `${baseUrl}${imageUrl}`;
};

// 打开二维码弹窗并加载二维码
const openQR = async () => {
  qrLoading.value = true;
  qrCodeImage.value = '';
  showQR.value = true;
  try {
    const res: any = await drawerApi.getQRCode(Number(route.params.id));
    qrCodeImage.value = res.qrCodeImage || res.data?.qrCodeImage || '';
  } catch (error) {
    console.error('加载二维码失败:', error);
  } finally {
    qrLoading.value = false;
  }
};

// 下载二维码图片
const downloadQR = () => {
  if (!qrCodeImage.value) return;
  const a = document.createElement('a');
  a.href = qrCodeImage.value;
  a.download = `抽屉二维码-${drawer.value?.name || drawer.value?.id}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
const showItemModal = ref(false);
const editingItem = ref<any>(null);

const getExpiryClass = (expiryDate: string) => {
  if (!expiryDate) return 'text-gray-500';
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'text-red-600 font-medium';
  if (diffDays <= 30) return 'text-yellow-600 font-medium';
  return 'text-gray-500';
};

const loadDrawer = async () => {
  try {
    const response = await drawerApi.getById(Number(route.params.id));
    const data = response.data || response;
    drawer.value = data;
    items.value = data.items || [];
  } catch (error) {
    console.error('加载抽屉失败:', error);
  }
};

const printQR = () => {
  if (qrCodeImage.value) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const html = `
        <html>
          <head>
            <title>打印二维码 - ${drawer.value?.name}</title>
            <style>
              body { text-align: center; padding: 20px; }
              img { max-width: 400px; }
              h2 { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h2>${drawer.value?.name}</h2>
            <img src="${qrCodeImage.value}" />
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 100);
    }
  }
};

const openAddItemModal = () => {
  editingItem.value = null;
  showItemModal.value = true;
};

const openEditItemModal = (item: any) => {
  editingItem.value = item;
  showItemModal.value = true;
};

const closeItemModal = () => {
  showItemModal.value = false;
  editingItem.value = null;
};

const deleteItem = async (itemId: number) => {
  if (!confirm('确定要删除这个物品吗？')) {
    return;
  }
  
  try {
    await itemApi.delete(itemId);
    await loadDrawer();
  } catch (error: any) {
    console.error('删除物品失败:', error);
    alert(error.response?.data?.error || '删除物品失败');
  }
};

onMounted(() => {
  loadDrawer();
});
</script>
