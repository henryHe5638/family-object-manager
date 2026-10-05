<template>
  <BaseModal :show="show" title="物品到期提醒" @close="close">
    <div v-if="expiredItems.length > 0" class="mb-4">
      <h4 class="text-md font-semibold text-red-600 dark:text-red-400 mb-2">已过期物品 ({{ expiredItems.length }})</h4>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="item in expiredItems"
          :key="item.id"
          class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"
        >
          <div class="font-medium text-gray-900 dark:text-white">{{ item.name }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-300">
            类目: {{ item.category_name || '无' }} | 位置: {{ item.location_name || '无' }}
          </div>
          <div class="text-sm text-red-600 dark:text-red-400">
            过期时间: {{ formatDate(item.expiry_date) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="expiringItems.length > 0" class="mb-4">
      <h4 class="text-md font-semibold text-yellow-600 dark:text-yellow-400 mb-2">即将到期物品 ({{ expiringItems.length }})</h4>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="item in expiringItems"
          :key="item.id"
          class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded"
        >
          <div class="font-medium text-gray-900 dark:text-white">{{ item.name }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-300">
            类目: {{ item.category_name || '无' }} | 位置: {{ item.location_name || '无' }}
          </div>
          <div class="text-sm text-yellow-600 dark:text-yellow-400">
            到期时间: {{ formatDate(item.expiry_date) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="expiredItems.length === 0 && expiringItems.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <svg class="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p>暂无到期或即将到期的物品</p>
    </div>

    <div class="mt-4 flex justify-end">
      <button
        @click="close"
        class="btn btn-primary"
      >
        知道了
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { itemApi } from '../api/modules';
import BaseModal from './BaseModal.vue';

const show = ref(false);
const expiredItems = ref<any[]>([]);
const expiringItems = ref<any[]>([]);

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
};

const loadExpiryData = async () => {
  try {
    const [expiredRes, expiringRes] = await Promise.all([
      itemApi.getExpired(),
      itemApi.getExpiring(30),
    ]);
    
    expiredItems.value = expiredRes.data || expiredRes;
    expiringItems.value = expiringRes.data || expiringRes;
    
    // 只有当有到期或即将到期的物品时才显示弹窗
    if (expiredItems.value.length > 0 || expiringItems.value.length > 0) {
      show.value = true;
    }
  } catch (error) {
    console.error('加载到期数据失败:', error);
  }
};

const close = () => {
  show.value = false;
};

onMounted(() => {
  loadExpiryData();
});

defineExpose({
  show,
  loadExpiryData,
});
</script>
