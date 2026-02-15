<template>
  <Layout>
    <ExpiryModal ref="expiryModal" />
    <div class="px-4 sm:px-0">
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">系统概览</h1>
        <router-link
          to="/scanner"
          class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5 8.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
          </svg>
          扫码识别
        </router-link>
      </div>
      
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">物品总数</dt>
                  <dd class="text-lg font-semibold text-gray-900">{{ stats.totalItems }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">抽屉数量</dt>
                  <dd class="text-lg font-semibold text-gray-900">{{ stats.totalDrawers }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">即将到期</dt>
                  <dd class="text-lg font-semibold text-yellow-600">{{ stats.expiringItems }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">已过期</dt>
                  <dd class="text-lg font-semibold text-red-600">{{ stats.expiredItems }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">最近添加的物品</h2>
          <div v-if="recentItems.length > 0" class="space-y-3">
            <div
              v-for="item in recentItems"
              :key="item.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <div>
                <div class="font-medium">{{ item.name }}</div>
                <div class="text-sm text-gray-500">{{ item.category_name || '无类目' }}</div>
              </div>
              <div class="text-sm text-gray-500">
                {{ formatDate(item.created_at) }}
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            暂无物品
          </div>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">快速操作</h2>
          <div class="space-y-3">
            <router-link
              to="/items"
              class="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded hover:bg-blue-700"
            >
              添加物品
            </router-link>
            <router-link
              to="/drawers"
              class="block w-full px-4 py-3 bg-green-600 text-white text-center rounded hover:bg-green-700"
            >
              创建抽屉
            </router-link>
            <router-link
              to="/locations"
              class="block w-full px-4 py-3 bg-purple-600 text-white text-center rounded hover:bg-purple-700"
            >
              管理地点
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Layout from '../components/Layout.vue';
import ExpiryModal from '../components/ExpiryModal.vue';
import { itemApi, drawerApi } from '../api/modules';

const stats = ref({
  totalItems: 0,
  totalDrawers: 0,
  expiringItems: 0,
  expiredItems: 0,
});

const recentItems = ref<any[]>([]);
const expiryModal = ref();

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
};

const loadDashboardData = async () => {
  try {
    const [itemsRes, drawersRes, expiringRes, expiredRes] = await Promise.all([
      itemApi.getAll(),
      drawerApi.getAll(),
      itemApi.getExpiring(30),
      itemApi.getExpired(),
    ]);

    const items = itemsRes.data || itemsRes;
    const drawers = drawersRes.data || drawersRes;
    const expiring = expiringRes.data || expiringRes;
    const expired = expiredRes.data || expiredRes;
    
    stats.value.totalItems = items.length;
    stats.value.totalDrawers = drawers.length;
    stats.value.expiringItems = expiring.length;
    stats.value.expiredItems = expired.length;

    recentItems.value = items.slice(0, 5);
  } catch (error) {
    console.error('加载数据失败:', error);
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>
