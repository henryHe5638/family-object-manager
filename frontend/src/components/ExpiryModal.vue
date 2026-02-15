<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="close"
  >
    <div
      class="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white"
      @click.stop
    >
      <div class="mt-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">物品到期提醒</h3>
          <button @click="close" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div v-if="expiredItems.length > 0" class="mb-4">
          <h4 class="text-md font-semibold text-red-600 mb-2">已过期物品 ({{ expiredItems.length }})</h4>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div
              v-for="item in expiredItems"
              :key="item.id"
              class="p-3 bg-red-50 border border-red-200 rounded"
            >
              <div class="font-medium">{{ item.name }}</div>
              <div class="text-sm text-gray-600">
                类目: {{ item.category_name || '无' }} | 位置: {{ item.location_name || '无' }}
              </div>
              <div class="text-sm text-red-600">
                过期时间: {{ formatDate(item.expiry_date) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="expiringItems.length > 0" class="mb-4">
          <h4 class="text-md font-semibold text-yellow-600 mb-2">即将到期物品 ({{ expiringItems.length }})</h4>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div
              v-for="item in expiringItems"
              :key="item.id"
              class="p-3 bg-yellow-50 border border-yellow-200 rounded"
            >
              <div class="font-medium">{{ item.name }}</div>
              <div class="text-sm text-gray-600">
                类目: {{ item.category_name || '无' }} | 位置: {{ item.location_name || '无' }}
              </div>
              <div class="text-sm text-yellow-600">
                到期时间: {{ formatDate(item.expiry_date) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="expiredItems.length === 0 && expiringItems.length === 0" class="text-center py-8 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>暂无到期或即将到期的物品</p>
        </div>

        <div class="mt-4 flex justify-end">
          <button
            @click="close"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { itemApi } from '../api/modules';

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
