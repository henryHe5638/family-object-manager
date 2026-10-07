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
          <div class="flex gap-2">
            <button
              @click="openAddItemModal"
              class="btn btn-primary"
            >
              + 添加物品
            </button>
            <button
              @click="openBatchModal"
              class="btn btn-secondary"
            >
              批量添加
            </button>
          </div>
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

      <!-- 二维码弹窗（与抽屉列表页一致，复用 QRCodeDisplay） -->
      <BaseModal
        :show="showQR"
        :title="`${drawer?.name} 的二维码`"
        max-width="max-w-md"
        @close="showQR = false"
      >
        <QRCodeDisplay
          v-if="showQR"
          :item-id="Number(route.params.id)"
          :item-name="drawer?.name"
          item-type="drawer"
        />
        <div class="flex justify-end mt-4">
          <button type="button" @click="showQR = false" class="btn btn-secondary">关闭</button>
        </div>
      </BaseModal>

      <!-- 批量添加物品弹窗 -->
      <BaseModal
        :show="showBatchModal"
        title="批量添加物品到抽屉"
        max-width="max-w-lg"
        @close="showBatchModal = false"
      >
        <div v-if="batchLoading" class="py-8 text-center text-gray-400">加载中...</div>
        <template v-else>
          <div class="flex items-center space-x-2 mb-3">
            <input
              v-model="batchFilter"
              type="text"
              class="input-inline flex-1"
              placeholder="搜索物品名称..."
            />
          </div>
          <div class="flex items-center justify-between mb-2">
            <label class="flex items-center text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                class="checkbox mr-2"
                :checked="isAllFilteredSelected"
                @change="toggleSelectAllFiltered"
              />
              全选
            </label>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              已选 {{ batchSelected.length }} / {{ filteredBatchCandidates.length }}
            </span>
          </div>
          <div v-if="filteredBatchCandidates.length === 0" class="py-8 text-center text-gray-500 dark:text-gray-400">
            {{ batchCandidates.length === 0 ? "没有可添加的物品" : "没有匹配的物品" }}
          </div>
          <div v-else class="space-y-2">
            <label
              v-for="item in filteredBatchCandidates"
              :key="item.id"
              class="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
            >
              <input
                type="checkbox"
                class="checkbox shrink-0"
                :checked="batchSelected.includes(item.id)"
                @change="toggleBatchSelect(item.id)"
              />
              <img
                v-if="item.image_data || item.image_url"
                :src="getImageUrl(item.image_url, item.image_data)"
                :alt="item.name"
                class="h-12 w-12 object-contain rounded bg-white dark:bg-gray-600 shrink-0"
              />
              <div v-else class="h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ item.name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ [item.category_name, item.location_name, item.drawer_name && `抽屉：${item.drawer_name}`].filter(Boolean).join(" · ") || "-" }}
                </p>
              </div>
            </label>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="showBatchModal = false" class="btn btn-secondary">取消</button>
            <button
              type="button"
              @click="confirmBatchAdd"
              :disabled="batchSelected.length === 0 || batchSubmitting"
              class="btn btn-primary"
            >
              {{ batchSubmitting ? "添加中..." : `确认添加 (${batchSelected.length})` }}
            </button>
          </div>
        </template>
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
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import Layout from '../components/Layout.vue';
import BaseModal from '../components/BaseModal.vue';
import ItemFormModal from '../components/ItemFormModal.vue';
import QRCodeDisplay from '../components/QRCodeDisplay.vue';
import { drawerApi, itemApi } from '../api/modules';

const route = useRoute();
const drawer = ref<any>(null);
const items = ref<any[]>([]);
const showQR = ref(false);

// 打开二维码弹窗（QRCodeDisplay 内部通过 drawerApi.getQRCode 现取二维码）
const openQR = () => {
  showQR.value = true;
};

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

// 批量添加物品
const showBatchModal = ref(false);
const batchLoading = ref(false);
const batchSubmitting = ref(false);
const batchCandidates = ref<any[]>([]);
const batchSelected = ref<number[]>([]);
const batchFilter = ref('');

const openBatchModal = async () => {
  batchSelected.value = [];
  batchFilter.value = '';
  batchCandidates.value = [];
  showBatchModal.value = true;
  batchLoading.value = true;
  try {
    const res: any = await itemApi.getAll();
    const all = res.data || res;
    const drawerId = Number(route.params.id);
    // 排除已在当前抽屉中的物品
    batchCandidates.value = (all || []).filter((it: any) => it.drawer_id !== drawerId);
  } catch (error) {
    console.error('加载物品列表失败:', error);
    alert('加载物品列表失败');
  } finally {
    batchLoading.value = false;
  }
};

const filteredBatchCandidates = computed(() => {
  const q = batchFilter.value.trim().toLowerCase();
  if (!q) return batchCandidates.value;
  return batchCandidates.value.filter((it: any) =>
    (it.name || '').toString().toLowerCase().includes(q)
  );
});

const isAllFilteredSelected = computed(() => {
  const list = filteredBatchCandidates.value;
  return list.length > 0 && list.every((it: any) => batchSelected.value.includes(it.id));
});

const toggleBatchSelect = (id: number) => {
  const idx = batchSelected.value.indexOf(id);
  if (idx >= 0) {
    batchSelected.value.splice(idx, 1);
  } else {
    batchSelected.value.push(id);
  }
};

const toggleSelectAllFiltered = () => {
  const list = filteredBatchCandidates.value;
  if (isAllFilteredSelected.value) {
    const ids = new Set(list.map((it: any) => it.id));
    batchSelected.value = batchSelected.value.filter((id) => !ids.has(id));
  } else {
    const existing = new Set(batchSelected.value);
    list.forEach((it: any) => existing.add(it.id));
    batchSelected.value = Array.from(existing);
  }
};

const confirmBatchAdd = async () => {
  const drawerId = Number(route.params.id);
  batchSubmitting.value = true;
  try {
    // 现有 API 只有单条更新，逐条更新 drawer_id
    for (const id of batchSelected.value) {
      await itemApi.update(id, { drawer_id: drawerId });
    }
    showBatchModal.value = false;
    await loadDrawer();
  } catch (error: any) {
    console.error('批量添加失败:', error);
    alert(error.response?.data?.error || '批量添加失败');
  } finally {
    batchSubmitting.value = false;
  }
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
