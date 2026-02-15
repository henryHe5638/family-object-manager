<template>
  <Layout>
    <div class="px-4 sm:px-6 lg:px-8 py-4">
      <!-- 返回按钮 -->
      <button @click="goBack" class="mb-4 inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">加载中...</p>
      </div>

      <div v-else-if="location" class="space-y-6">
        <!-- 地点信息卡片 -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ location.name }}</h1>
              <p v-if="location.description" class="mt-2 text-gray-600 dark:text-gray-400">{{ location.description }}</p>
            </div>
            <router-link :to="`/locations`" class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
              编辑
            </router-link>
          </div>
          
          <div class="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <div class="text-xl sm:text-2xl font-bold text-blue-600">{{ itemCount }}</div>
              <div class="text-xs sm:text-sm text-gray-600">物品数量</div>
            </div>
            <div class="bg-green-50 p-3 sm:p-4 rounded-lg">
              <div class="text-xl sm:text-2xl font-bold text-green-600">{{ drawerCount }}</div>
              <div class="text-xs sm:text-sm text-gray-600">抽屉数量</div>
            </div>
            <div class="bg-purple-50 p-3 sm:p-4 rounded-lg">
              <div class="text-xl sm:text-2xl font-bold text-purple-600">{{ totalValue }}</div>
              <div class="text-xs sm:text-sm text-gray-600">总价值</div>
            </div>
            <div class="bg-yellow-50 p-3 sm:p-4 rounded-lg">
              <div class="text-xl sm:text-2xl font-bold text-yellow-600">{{ expiringCount }}</div>
              <div class="text-xs sm:text-sm text-gray-600">即将过期</div>
            </div>
          </div>
        </div>

        <!-- 抽屉列表 -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">该地点的抽屉</h2>
          <div v-if="drawers.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            <router-link v-for="drawer in drawers" :key="drawer.id" :to="`/drawers/${drawer.id}`" class="block bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div v-if="drawer.image_data || drawer.image_url" class="aspect-square bg-gray-200 dark:bg-gray-600 rounded mb-2 overflow-hidden">
                <img :src="getImageUrl(drawer.image_url)" :alt="drawer.name" class="w-full h-full object-cover" />
              </div>
              <div v-else class="aspect-square bg-gray-200 dark:bg-gray-600 rounded mb-2 flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 class="font-medium text-gray-900 dark:text-white text-sm truncate">{{ drawer.name }}</h3>
              <p v-if="drawer.description" class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{{ drawer.description }}</p>
            </router-link>
          </div>
          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            该地点暂无抽屉
          </div>
        </div>

        <!-- 物品列表 -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">该地点的物品</h2>
          <div v-if="items.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            <router-link v-for="item in items" :key="item.id" :to="`/items/${item.id}`" class="block bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div class="aspect-square bg-gray-200 dark:bg-gray-600">
                <img v-if="item.image_data || item.image_url" :src="getImageUrl(item.image_url)" :alt="item.name" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="p-3">
                <h3 class="font-medium text-gray-900 text-sm truncate">{{ item.name }}</h3>
                <p class="text-xs text-gray-500 truncate">{{ item.category_name || '-' }}</p>
                <div class="mt-2 flex items-center justify-between text-xs">
                  <span class="text-gray-600">x{{ item.quantity }}</span>
                  <span v-if="item.purchase_price" class="text-blue-600 font-medium">¥{{ item.purchase_price }}</span>
                </div>
                <div v-if="item.expiry_date" class="mt-1 text-xs" :class="getExpiryClass(item.expiry_date)">
                  {{ item.expiry_date }}
                </div>
              </div>
            </router-link>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            该地点暂无物品
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-600">地点不存在</p>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Layout from '../components/Layout.vue';
import { locationApi, itemApi, drawerApi } from '../api/modules';

const route = useRoute();
const router = useRouter();

const location = ref<any>(null);
const items = ref<any[]>([]);
const drawers = ref<any[]>([]);
const loading = ref(true);

const itemCount = computed(() => items.value.length);
const drawerCount = computed(() => drawers.value.length);
const totalValue = computed(() => {
  const total = items.value.reduce((sum, item) => sum + (item.purchase_price || 0) * (item.quantity || 1), 0);
  return `¥${total.toFixed(2)}`;
});
const expiringCount = computed(() => {
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  return items.value.filter(item => {
    if (!item.expiry_date) return false;
    const expiry = new Date(item.expiry_date);
    return expiry >= today && expiry <= thirtyDaysLater;
  }).length;
});

const getExpiryClass = (expiryDate: string) => {
  if (!expiryDate) return 'text-gray-500';
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'text-red-600 font-medium';
  if (diffDays <= 30) return 'text-yellow-600 font-medium';
  return 'text-gray-500';
};

const loadData = async () => {
  loading.value = true;
  try {
    const id = Number(route.params.id);
    
    // 加载地点信息
    const locations = await locationApi.getAll();
    const locationsData = locations.data || locations;
    location.value = locationsData.find((l: any) => l.id === id);
    
    if (!location.value) {
      loading.value = false;
      return;
    }
    
    // 加载该地点的物品
    const allItems = await itemApi.getAll();
    const itemsData = allItems.data || allItems;
    items.value = itemsData.filter((item: any) => item.location_id === id);
    
    // 加载该地点的抽屉
    const allDrawers = await drawerApi.getAll();
    const drawersData = allDrawers.data || allDrawers;
    drawers.value = drawersData.filter((drawer: any) => drawer.location_id === id);
    
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `http://localhost:3000${imageUrl}`;
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  loadData();
});
</script>
