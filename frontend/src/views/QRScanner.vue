<template>
  <Layout>
    <div class="px-4 sm:px-0">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">扫描二维码</h1>
      
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-600 dark:text-gray-400">加载中...</p>
      </div>

      <div v-else-if="drawer" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{{ drawer.name }}</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ drawer.description || '无描述' }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">地点: {{ drawer.location_name || '无' }}</p>

        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">抽屉中的物品</h3>
        <div v-if="drawer.items && drawer.items.length > 0" class="space-y-3">
          <div
            v-for="item in drawer.items"
            :key="item.id"
            class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div class="font-medium text-gray-900 dark:text-white">{{ item.name }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ item.description || '无描述' }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              类目: {{ item.category_name || '无' }} | 数量: {{ item.quantity }}
              <span v-if="item.purchase_price"> | 价格: ¥{{ item.purchase_price }}</span>
            </div>
            <div v-if="item.expiry_date" class="text-sm mt-1" :class="getExpiryClass(item.expiry_date)">
              到期日期: {{ item.expiry_date }}
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
          此抽屉中暂无物品
        </div>
      </div>

      <div v-else class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p class="text-red-800 dark:text-red-400">未找到对应的抽屉</p>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Layout from '../components/Layout.vue';
import { drawerApi, itemApi } from '../api/modules';

const route = useRoute();
const router = useRouter();
const drawer = ref<any>(null);
const loading = ref(true);

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
  loading.value = true;
  try {
    const qrCode = route.params.qrCode as string;
    
    // 如果是物品二维码，直接跳转到物品详情页
    if (qrCode.startsWith('ITEM-')) {
      router.replace({ name: 'ItemDetail', params: { id: 0 }, query: { qr: qrCode } });
      return;
    }
    
    // 否则作为抽屉二维码处理
    const response = await drawerApi.getByQRCode(qrCode);
    drawer.value = response;
  } catch (error) {
    console.error('加载抽屉失败:', error);
    // 如果抽屉加载失败，尝试作为物品二维码
    try {
      const qrCode = route.params.qrCode as string;
      router.replace({ name: 'ItemDetail', params: { id: 0 }, query: { qr: qrCode } });
      return;
    } catch {
      drawer.value = null;
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDrawer();
});
</script>
