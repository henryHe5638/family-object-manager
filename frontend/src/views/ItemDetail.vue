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

      <div v-else-if="item" class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <!-- 头部：图片和基本信息 -->
        <div class="flex flex-col md:flex-row">
          <!-- 左侧：图片 -->
          <div class="w-full md:w-1/2 bg-gray-100">
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
              <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">{{ item.name }}</h1>
              <button @click="editMode = !editMode" class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 self-start">
                {{ editMode ? '取消编辑' : '编辑' }}
              </button>
            </div>

            <div v-if="!editMode" class="space-y-4">
              <div>
                <label class="text-sm font-medium text-gray-500">描述</label>
                <p class="text-gray-900">{{ item.description || '-' }}</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">类目</label>
                  <p class="text-gray-900">{{ item.category_name || '-' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">数量</label>
                  <p class="text-gray-900">{{ item.quantity }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">地点</label>
                  <p class="text-gray-900">{{ item.location_name || '-' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">抽屉</label>
                  <p class="text-gray-900">{{ item.drawer_name || '-' }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">购买价格</label>
                  <p class="text-gray-900">{{ item.purchase_price ? `¥${item.purchase_price}` : '-' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">购买日期</label>
                  <p class="text-gray-900">{{ item.purchase_date || '-' }}</p>
                </div>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-500">到期日期</label>
                <p class="text-gray-900">{{ item.expiry_date || '-' }}</p>
              </div>

              <div class="pt-4 border-t">
                <label class="text-sm font-medium text-gray-500 block mb-2">二维码</label>
                <QRCodeDisplay v-if="item.id" :itemId="item.id" :itemName="item.name" />
              </div>
            </div>

            <!-- 编辑表单 -->
            <form v-else @submit.prevent="saveItem" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">名称 *</label>
                <input v-model="editForm.name" required class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">描述</label>
                <textarea v-model="editForm.description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">类目</label>
                <CategorySelector 
                  @select="(data: any) => editForm.item_category_id = data.itemCategoryId"
                  :initial-category-id="editForm.item_category_id"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">地点</label>
                <select v-model="editForm.location_id" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option :value="null">无</option>
                  <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                </select>
              </div>

              <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">抽屉</label>
                  <select v-model="editForm.drawer_id" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option :value="null">无</option>
                  <option v-for="drawer in drawers" :key="drawer.id" :value="drawer.id">{{ drawer.name }}</option>
                </select>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">数量</label>
                  <input v-model.number="editForm.quantity" type="number" min="1" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">购买价格</label>
                  <input v-model.number="editForm.purchase_price" type="number" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">购买日期</label>
                  <input v-model="editForm.purchase_date" type="date" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">到期日期</label>
                  <input v-model="editForm.expiry_date" type="date" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">物品图片</label>
                <ImageUpload v-model="editForm.image_url" />
              </div>

              <div class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                <button type="button" @click="editMode = false" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">取消</button>
                <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">保存</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-600">物品不存在</p>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Layout from '../components/Layout.vue';
import QRCodeDisplay from '../components/QRCodeDisplay.vue';
import ImageUpload from '../components/ImageUpload.vue';
import CategorySelector from '../components/CategorySelector.vue';
import { itemApi, locationApi, drawerApi } from '../api/modules';

const route = useRoute();
const router = useRouter();

const item = ref<any>(null);
const loading = ref(true);
const editMode = ref(false);
const locations = ref<any[]>([]);
const drawers = ref<any[]>([]);

const editForm = reactive({
  name: '',
  description: '',
  item_category_id: undefined as number | undefined,
  location_id: null,
  drawer_id: null,
  quantity: 1,
  purchase_price: null,
  purchase_date: '',
  expiry_date: '',
  image_url: undefined as string | undefined,
});

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

    if (item.value) {
      // 填充编辑表单
      Object.assign(editForm, {
        name: item.value.name,
        description: item.value.description,
        item_category_id: item.value.item_category_id,
        location_id: item.value.location_id,
        drawer_id: item.value.drawer_id,
        quantity: item.value.quantity,
        purchase_price: item.value.purchase_price,
        purchase_date: item.value.purchase_date,
        expiry_date: item.value.expiry_date,
        image_url: item.value.image_url,
      });
    }
  } catch (error) {
    console.error('加载物品失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadData = async () => {
  try {
    const [locationsRes, drawersRes] = await Promise.all([
      locationApi.getAll(),
      drawerApi.getAll(),
    ]);
    locations.value = locationsRes.data || locationsRes;
    drawers.value = drawersRes.data || drawersRes;
  } catch (error) {
    console.error('加载数据失败:', error);
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

const saveItem = async () => {
  try {
    await itemApi.update(item.value.id, editForm);
    await loadItem();
    editMode.value = false;
    alert('保存成功');
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败');
  }
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  loadItem();
  loadData();
});
</script>
