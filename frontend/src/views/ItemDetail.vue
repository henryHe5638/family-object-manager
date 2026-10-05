<template>
  <Layout>
    <div class="px-4 sm:px-6 lg:px-8 py-4">
      <!-- 返回按钮 -->
      <button @click="goBack" class="mb-4 btn btn-ghost">
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">加载中...</p>
      </div>

      <div v-else-if="item" class="card">
        <!-- 头部：图片和基本信息 -->
        <div class="flex flex-col md:flex-row">
          <!-- 左侧：图片 -->
          <div class="w-full md:w-1/2 bg-gray-100 dark:bg-gray-700">
            <div class="aspect-square flex items-center justify-center p-4">
              <img 
                v-if="item.image_data || item.image_url" 
                :src="getImageUrl(item.image_url)" 
                :alt="item.name"
                class="max-w-full max-h-full object-contain rounded-lg"
              />
              <div v-else class="text-center text-gray-400">
                <svg class="w-32 h-32 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="mt-2">暂无图片</p>
              </div>
            </div>
          </div>

          <!-- 右侧：详细信息 -->
          <div class="w-full md:w-1/2 p-4 sm:p-6">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
              <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">{{ item.name }}</h1>
              <button @click="showEditModal = true" class="btn btn-primary btn-sm self-start">
                编辑
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="form-label">描述</label>
                <p class="text-gray-900 dark:text-gray-100">{{ item.description || '-' }}</p>
              </div>

              <div>
                <label class="form-label">状态</label>
                <div class="flex items-center space-x-3">
                  <span
                    class="badge"
                    :class="getStatusMeta(item).badgeClass"
                  >
                    {{ getStatusMeta(item).text }}
                  </span>
                  <button
                    v-if="(item.status || 'stored') !== 'in_use'"
                    @click="markStatus('in_use')"
                    class="link-btn link-success"
                  >
                    标记为使用中
                  </button>
                  <button
                    v-if="(item.status || 'stored') === 'in_use'"
                    @click="markStatus('stored')"
                    class="link-btn link-neutral"
                  >
                    放回库存
                  </button>
                  <button
                    v-if="(item.status || 'stored') !== 'discarded'"
                    @click="markStatus('discarded')"
                    class="link-btn link-warning"
                  >
                    丢弃
                  </button>
                  <button
                    v-else
                    @click="markStatus('stored')"
                    class="link-btn link-neutral"
                  >
                    恢复在库
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">类目</label>
                  <p class="text-gray-900 dark:text-gray-100">{{ item.category_name || '-' }}</p>
                </div>
                <div>
                  <label class="form-label">品牌</label>
                  <p class="text-gray-900 dark:text-gray-100">{{ item.brand || '-' }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">大小</label>
                  <p class="text-gray-900 dark:text-gray-100">{{ item.size || '-' }}</p>
                </div>
                <div>
                  <label class="form-label">数量</label>
                  <p class="text-gray-900 dark:text-gray-100">{{ item.quantity }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">地点</label>
                  <p class="text-gray-900 dark:text-gray-100">{{ item.location_name || '-' }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">抽屉</label>
                  <p class="text-gray-900 dark:text-gray-100">{{ item.drawer_name || '-' }}</p>
                </div>
                <div>
                  <label class="form-label">购买价格</label>
                  <p class="text-gray-900 dark:text-gray-100">{{ item.purchase_price ? `¥${item.purchase_price}` : '-' }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">购买日期</label>
                  <p class="text-gray-900 dark:text-gray-100">{{ item.purchase_date || '-' }}</p>
                </div>
                <div>
                  <label class="form-label">生产日期</label>
                  <p class="text-gray-900 dark:text-gray-100">{{ item.production_date || '-' }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">到期日期</label>
                  <p class="text-gray-900 dark:text-gray-100">{{ item.expiry_date || '-' }}</p>
                </div>
              </div>

              <div class="pt-4 border-t dark:border-gray-700">
                <label class="form-label mb-2">二维码</label>
                <QRCodeDisplay v-if="item.id" :itemId="item.id" :itemName="item.name" />
              </div>
            </div>

          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">物品不存在</p>
      </div>

      <!-- 编辑物品弹窗（共享组件） -->
      <ItemFormModal
        :show="showEditModal"
        :item="item"
        @close="showEditModal = false"
        @saved="loadItem"
      />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Layout from '../components/Layout.vue';
import QRCodeDisplay from '../components/QRCodeDisplay.vue';
import ItemFormModal from '../components/ItemFormModal.vue';
import { itemApi } from '../api/modules';

const route = useRoute();
const router = useRouter();

const item = ref<any>(null);
const loading = ref(true);
const showEditModal = ref(false);

// 物品状态展示配置
const STATUS_META: Record<string, { text: string; badgeClass: string }> = {
  stored: { text: '在库', badgeClass: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  in_use: { text: '使用中', badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  discarded: { text: '已丢弃', badgeClass: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' },
};

const getStatusMeta = (item: any): { text: string; badgeClass: string } => {
  return STATUS_META[item.status || 'stored'] || STATUS_META.stored!;
};

const markStatus = async (status: string) => {
  try {
    await itemApi.updateStatus(item.value.id, status);
    await loadItem();
  } catch (error) {
    console.error('更新状态失败:', error);
    alert('更新状态失败');
  }
};

const loadItem = async () => {
  loading.value = true;
  try {
    const id = route.params.id;
    const qrCode = route.query.qr;

    if (qrCode) {
      // 通过二维码获取物品
      item.value = await itemApi.getByQRCode(qrCode as string);
    } else if (id) {
      // 通过ID获取物品
      item.value = await itemApi.getById(Number(id));
    }
  } catch (error) {
    console.error('加载物品失败:', error);
  } finally {
    loading.value = false;
  }
};

const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('data:')) return imageUrl;
  if (imageUrl.startsWith('http')) return imageUrl;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const shouldUseRuntime =
    typeof window !== 'undefined' &&
    apiUrl.includes('localhost') &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';
  const runtimeBase = typeof window !== 'undefined' ? window.location.origin : '';
  const baseUrl = shouldUseRuntime ? runtimeBase : apiUrl.replace('/api', '');
  return `${baseUrl}${imageUrl}`;
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  loadItem();
});
</script>
