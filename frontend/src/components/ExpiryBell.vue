<template>
  <div class="relative">
    <!-- 铃铛按钮 -->
    <button 
      @click="toggleDropdown"
      class="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      :class="{ 'text-red-600': expiryCount > 0 }"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
        />
      </svg>
      
      <!-- 角标 -->
      <span 
        v-if="expiryCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-bold"
      >
        {{ expiryCount > 99 ? '99+' : expiryCount }}
      </span>
    </button>

    <!-- 下拉提醒列表 -->
    <div 
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
    >
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-bold text-gray-900">到期提醒</h3>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <!-- 已过期物品 -->
        <div v-if="expiredItems.length > 0" class="p-3 bg-red-50">
          <h4 class="text-sm font-semibold text-red-800 mb-2">已过期 ({{ expiredItems.length }})</h4>
          <div 
            v-for="item in expiredItems" 
            :key="'expired-' + item.id"
            class="bg-white rounded p-3 mb-2 last:mb-0 border-l-4 border-red-500"
          >
            <div class="font-medium text-gray-900">{{ item.name }}</div>
            <div class="text-sm text-gray-600 mt-1">
              <span>{{ item.category_name || '未分类' }}</span>
              <span v-if="item.location_name"> · {{ item.location_name }}</span>
            </div>
            <div class="text-sm text-red-600 mt-1">
              到期时间: {{ formatDate(item.expiry_date) }}
            </div>
          </div>
        </div>

        <!-- 即将到期物品 -->
        <div v-if="expiringItems.length > 0" class="p-3">
          <h4 class="text-sm font-semibold text-yellow-800 mb-2">即将到期 ({{ expiringItems.length }})</h4>
          <div 
            v-for="item in expiringItems" 
            :key="'expiring-' + item.id"
            class="bg-white rounded p-3 mb-2 last:mb-0 border-l-4 border-yellow-500"
          >
            <div class="font-medium text-gray-900">{{ item.name }}</div>
            <div class="text-sm text-gray-600 mt-1">
              <span>{{ item.category_name || '未分类' }}</span>
              <span v-if="item.location_name"> · {{ item.location_name }}</span>
            </div>
            <div class="text-sm text-yellow-600 mt-1">
              到期时间: {{ formatDate(item.expiry_date) }} ({{ getDaysLeft(item.expiry_date) }}天后)
            </div>
          </div>
        </div>

        <!-- 无到期提醒 -->
        <div 
          v-if="expiryCount === 0" 
          class="p-8 text-center text-gray-500"
        >
          <svg class="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="font-medium">暂无到期或即将到期的物品</p>
        </div>
      </div>

      <div class="p-3 border-t border-gray-200 bg-gray-50">
        <button
          @click="closeDropdown"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { itemApi } from '../api/modules';

const expiredItems = ref<any[]>([]);
const expiringItems = ref<any[]>([]);
const showDropdown = ref(false);

const expiryCount = computed(() => {
  return expiredItems.value.length + expiringItems.value.length;
});

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
};

const getDaysLeft = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

const loadExpiryData = async () => {
  try {
    const [expired, expiring] = await Promise.all([
      itemApi.getExpired(),
      itemApi.getExpiring(30),
    ]);
    
    expiredItems.value = expired;
    expiringItems.value = expiring;
  } catch (error) {
    console.error('加载到期数据失败:', error);
  }
};

// 点击外部关闭下拉框
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (showDropdown.value && !target.closest('.relative')) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  loadExpiryData();
  document.addEventListener('click', handleClickOutside);
});

// 暴露方法供外部调用
defineExpose({
  loadExpiryData
});
</script>
