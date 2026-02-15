<template>
  <Layout>
    <div class="px-4 sm:px-0">
      <router-link to="/drawers" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 inline-block">
        ← 返回抽屉列表
      </router-link>

      <div v-if="drawer" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ drawer.name }}</h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ drawer.description || '无描述' }}</p>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">地点: {{ drawer.location_name || '无' }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">抽屉中的物品</h2>
          <button
            @click="openAddItemModal"
            class="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            + 添加物品
          </button>
        </div>
        
        <div v-if="items.length > 0" class="space-y-3">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div class="flex-1">
              <div class="font-medium text-gray-900 dark:text-white">{{ item.name }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ item.description || '无描述' }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                类目: {{ item.category_name || '无' }} | 数量: {{ item.quantity }}
              </div>
              <div v-if="item.expiry_date" class="text-sm mt-1" :class="getExpiryClass(item.expiry_date)">
                到期日期: {{ item.expiry_date }}
              </div>
            </div>
            <div class="flex items-center space-x-2 ml-4">
              <div class="text-sm text-gray-500 mr-2">
                {{ item.purchase_price ? `¥${item.purchase_price}` : '' }}
              </div>
              <button
                @click="openEditItemModal(item)"
                class="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                编辑
              </button>
              <button
                @click="deleteItem(item.id)"
                class="px-3 py-1 text-sm bg-white border border-red-300 text-red-600 rounded hover:bg-red-50"
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
      <div v-if="showQR" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="showQR = false">
        <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800" @click.stop>
          <div class="text-center">
            <h3 class="text-lg font-medium mb-4 text-gray-900 dark:text-white">{{ drawer?.name }} 的二维码</h3>
            <img v-if="qrCodeImage" :src="qrCodeImage" alt="QR Code" class="mx-auto mb-4">
            <p class="text-sm text-gray-500 mb-4">扫描二维码访问抽屉</p>
            <button
              @click="printQR"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
            >
              打印二维码
            </button>
            <button
              @click="showQR = false"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      <!-- 添加/编辑物品弹窗 -->
      <div v-if="showItemModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeItemModal">
        <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white" @click.stop>
          <div class="p-6">
            <h3 class="text-lg font-medium mb-4">{{ editingItem ? '编辑物品' : '添加物品' }}</h3>
            
            <form @submit.prevent="saveItem" class="space-y-4">
              <!-- 类目选择器 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">物品类目</label>
                <CategorySelector @select="onCategorySelect" :initial-category-id="itemForm.item_category_id" />
              </div>

              <!-- 物品名称 -->
              <div>
                <label for="item-name" class="block text-sm font-medium text-gray-700 mb-1">物品名称</label>
                <input
                  id="item-name"
                  v-model="itemForm.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入物品名称"
                />
              </div>

              <!-- 描述 -->
              <div>
                <label for="item-description" class="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  id="item-description"
                  v-model="itemForm.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入物品描述"
                ></textarea>
              </div>

              <!-- 数量 -->
              <div>
                <label for="item-quantity" class="block text-sm font-medium text-gray-700 mb-1">数量</label>
                <input
                  id="item-quantity"
                  v-model.number="itemForm.quantity"
                  type="number"
                  min="1"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入数量"
                />
              </div>

              <!-- 购买价格 -->
              <div>
                <label for="item-price" class="block text-sm font-medium text-gray-700 mb-1">购买价格</label>
                <input
                  id="item-price"
                  v-model.number="itemForm.purchase_price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入购买价格"
                />
              </div>

              <!-- 到期日期 -->
              <div>
                <label for="item-expiry" class="block text-sm font-medium text-gray-700 mb-1">到期日期（可选）</label>
                <input
                  id="item-expiry"
                  v-model="itemForm.expiry_date"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- 按钮 -->
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="closeItemModal"
                  class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  取消
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {{ editingItem ? '保存' : '添加' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Layout from '../components/Layout.vue';
import CategorySelector from '../components/CategorySelector.vue';
import { drawerApi, itemApi } from '../api/modules';

const route = useRoute();
const drawer = ref<any>(null);
const items = ref<any[]>([]);
const showQR = ref(false);
const qrCodeImage = ref('');
const showItemModal = ref(false);
const editingItem = ref<any>(null);

const itemForm = ref({
  name: '',
  description: '',
  item_category_id: null as number | null,
  quantity: 1,
  purchase_price: undefined as number | undefined,
  expiry_date: '',
  drawer_id: Number(route.params.id)
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
  itemForm.value = {
    name: '',
    description: '',
    item_category_id: null,
    quantity: 1,
    purchase_price: undefined,
    expiry_date: '',
    drawer_id: Number(route.params.id)
  };
  showItemModal.value = true;
};

const openEditItemModal = (item: any) => {
  editingItem.value = item;
  itemForm.value = {
    name: item.name,
    description: item.description || '',
    item_category_id: item.item_category_id,
    quantity: item.quantity,
    purchase_price: item.purchase_price,
    expiry_date: item.expiry_date || '',
    drawer_id: item.drawer_id
  };
  showItemModal.value = true;
};

const closeItemModal = () => {
  showItemModal.value = false;
  editingItem.value = null;
};

const onCategorySelect = ({ itemCategoryId, name }: { itemCategoryId: number | null; name: string }) => {
  itemForm.value.item_category_id = itemCategoryId;
  if (itemCategoryId && !itemForm.value.name) {
    itemForm.value.name = name;
  }
};

const saveItem = async () => {
  try {
    const payload = {
      ...itemForm.value,
      expiry_date: itemForm.value.expiry_date || null,
      purchase_price: itemForm.value.purchase_price || null
    };

    if (editingItem.value) {
      await itemApi.update(editingItem.value.id, payload);
    } else {
      await itemApi.create(payload);
    }
    
    closeItemModal();
    await loadDrawer();
  } catch (error: any) {
    console.error('保存物品失败:', error);
    alert(error.response?.data?.error || '保存物品失败');
  }
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
