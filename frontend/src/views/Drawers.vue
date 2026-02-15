<template>
  <Layout>
    <div class="px-4 sm:px-0">
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">抽屉管理</h1>
        <button
          @click="openCreateModal"
          class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          添加抽屉
        </button>
      </div>

      <!-- 筛选和排序 -->
      <div class="mb-4 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
        <div
          class="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div
            class="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
          >
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700"
                >地点筛选：</label
              >
              <select
                v-model="selectedLocationId"
                class="flex-1 sm:flex-none rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border"
              >
                <option :value="null">全部</option>
                <option v-for="loc in locations" :key="loc.id" :value="loc.id">
                  {{ loc.name }}
                </option>
              </select>
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">排序：</label>
              <button
                @click="setSort('name')"
                :class="[
                  'px-3 py-2 text-sm rounded-md border',
                  sortKey === 'name'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                ]"
              >
                名称
              </button>
              <button
                @click="setSort('location_name')"
                :class="[
                  'px-3 py-2 text-sm rounded-md border',
                  sortKey === 'location_name'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                ]"
              >
                地点
              </button>
            </div>
          </div>

          <!-- 视图切换 -->
          <div class="flex items-center space-x-2 border-l pl-3">
            <label class="text-sm font-medium text-gray-700 whitespace-nowrap"
              >视图：</label
            >
            <button
              @click="viewMode = 'list'"
              :class="[
                'p-2 rounded-md border',
                viewMode === 'list'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
              ]"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
            <button
              @click="viewMode = 'grid'"
              :class="[
                'p-2 rounded-md border',
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
              ]"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div
        v-if="viewMode === 'list'"
        class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
      >
        <div class="overflow-x-auto">
          <div class="min-w-[600px]">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  class="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  图片
                </th>
                <th
                  class="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  名称
                </th>
                <th
                  class="hidden md:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  描述
                </th>
                <th
                  class="hidden sm:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  地点
                </th>
                <th
                  class="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="drawer in filteredAndSortedDrawers" :key="drawer.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
                  <img
                    v-if="drawer.image_url"
                    :src="getImageUrl(drawer.image_url)"
                    alt="抽屉图片"
                    class="h-12 w-12 object-cover rounded"
                  />
                  <div
                    v-else
                    class="h-12 w-12 bg-gray-200 rounded flex items-center justify-center"
                  >
                    <svg
                      class="h-6 w-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </td>
                <td
                  class="px-3 sm:px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900 dark:text-white"
                >
                  {{ drawer.name }}
                </td>
                <td
                  class="hidden md:table-cell px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-300"
                >
                  {{ drawer.description || "-" }}
                </td>
                <td
                  class="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-300"
                >
                  {{ drawer.location_name || "-" }}
                </td>
                <td
                  class="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-center"
                >
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <router-link
                      :to="`/drawers/${drawer.id}`"
                      class="px-2 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-xs sm:text-sm"
                      >查看</router-link
                    >
                    <button
                      @click="showQRCode(drawer)"
                      class="px-2 py-1 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-xs sm:text-sm"
                    >
                      二维码
                    </button>
                    <button
                      @click="editDrawer(drawer)"
                      class="px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs sm:text-sm"
                    >
                      编辑
                    </button>
                    <button
                      v-if="authStore.isAdmin"
                      @click="deleteDrawer(drawer.id)"
                      class="px-2 py-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-xs sm:text-sm"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <!-- 缩略图视图 -->
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <div
          v-for="drawer in filteredAndSortedDrawers"
          :key="drawer.id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow group"
        >
          <router-link
            :to="`/drawers/${drawer.id}`"
            class="block cursor-pointer"
          >
            <div class="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
              <img
                v-if="drawer.image_url"
                :src="getImageUrl(drawer.image_url)"
                :alt="drawer.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-gray-400"
              >
                <svg
                  class="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
            <div class="p-3">
              <h3 class="font-medium text-gray-900 text-sm truncate mb-1">
                {{ drawer.name }}
              </h3>
              <p class="text-xs text-gray-500 truncate">
                {{ drawer.location_name || "无地点" }}
              </p>
              <p
                v-if="drawer.description"
                class="text-xs text-gray-400 truncate mt-1"
              >
                {{ drawer.description }}
              </p>
            </div>
          </router-link>
          <div class="px-3 pb-3 flex gap-2">
            <button
              @click.stop="showQRCode(drawer)"
              class="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              二维码
            </button>
            <button
              @click.stop="editDrawer(drawer)"
              class="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              编辑
            </button>
            <button
              v-if="authStore.isAdmin"
              @click.stop="deleteDrawer(drawer.id)"
              class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              删
            </button>
          </div>
        </div>
      </div>

      <!-- 创建/编辑抽屉弹窗 -->
      <div
        v-if="showModal"
        :key="modalKey"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4"
        @click="closeModal"
      >
        <div
          id="drawer-modal"
          class="relative mx-auto border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800"
          style="top: 20px"
          @click.stop
        >
          <div class="p-4 sm:p-5">
            <h3 class="text-base sm:text-lg font-medium mb-4 text-gray-900 dark:text-white">
              {{ editingDrawer ? "编辑抽屉" : "创建抽屉" }}
            </h3>
            <form @submit.prevent="saveDrawer" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >名称 *</label
                >
                <input
                  v-model="form.name"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >描述</label
                >
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >地点</label
                >
                <select
                  v-model="form.location_id"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option :value="null">无</option>
                  <option
                    v-for="loc in locations"
                    :key="loc.id"
                    :value="loc.id"
                  >
                    {{ loc.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >抽屉图片</label
                >
                <ImageUpload v-model="form.image_url" />
              </div>

              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  class="px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- 二维码查看模态框 -->
      <div
        v-if="qrCodeModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4"
        @click="closeQRModal"
      >
        <div
          class="relative mx-auto border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800"
          style="top: 20px"
          @click.stop
        >
          <div class="p-4 sm:p-5">
            <h3 class="text-base sm:text-lg font-medium mb-4 text-gray-900 dark:text-white">
              {{ qrCodeModal.name }} 的二维码
            </h3>
            <QRCodeDisplay
              :item-id="qrCodeModal.id"
              :item-name="qrCodeModal.name"
              item-type="drawer"
            />
            <div class="flex justify-end mt-4">
              <button
                type="button"
                @click="closeQRModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 确认删除对话框 -->
      <ConfirmDialog
        ref="confirmDialog"
        title="删除抽屉"
        message="确定要删除这个抽屉吗？删除后无法恢复。"
        type="danger"
        @confirm="confirmDelete"
      />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, nextTick } from "vue";
import Layout from "../components/Layout.vue";
import { drawerApi, locationApi } from "../api/modules";
import { useAuthStore } from "../stores/auth";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import ImageUpload from "../components/ImageUpload.vue";
import QRCodeDisplay from "../components/QRCodeDisplay.vue";

const authStore = useAuthStore();

const drawers = ref<any[]>([]);
const locations = ref<any[]>([]);
const selectedLocationId = ref<number | null>(null);
const sortKey = ref<string>("name");
const sortOrder = ref<number>(1); // 1 asc, -1 desc
const viewMode = ref<"list" | "grid">("list");
const showModal = ref(false);
const editingDrawer = ref<any>(null);
const qrCodeModal = ref<any>(null);
const modalKey = ref(0); // 用于强制重渲染弹窗

const form = reactive({
  name: "",
  description: "",
  location_id: null,
  image_url: undefined as string | undefined,
});

const loadData = async () => {
  try {
    const [drawersRes, locationsRes] = await Promise.all([
      drawerApi.getAll(),
      locationApi.getAll(),
    ]);

    drawers.value = drawersRes.data || drawersRes;
    locations.value = locationsRes.data || locationsRes;
  } catch (error) {
    console.error("加载数据失败:", error);
  }
};

const setSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = -sortOrder.value;
  } else {
    sortKey.value = key;
    sortOrder.value = 1;
  }
};

const filteredAndSortedDrawers = computed(() => {
  let list = drawers.value.slice();
  if (selectedLocationId.value) {
    list = list.filter((d: any) => d.location_id === selectedLocationId.value);
  }

  list.sort((a: any, b: any) => {
    const ka = (a[sortKey.value] || "").toString().toLowerCase();
    const kb = (b[sortKey.value] || "").toString().toLowerCase();
    if (ka < kb) return -1 * sortOrder.value;
    if (ka > kb) return 1 * sortOrder.value;
    return 0;
  });
  return list;
});

const resetForm = () => {
  form.name = "";
  form.description = "";
  form.location_id = null;
  form.image_url = undefined;
};

const openCreateModal = async () => {
  resetForm();
  editingDrawer.value = null;
  modalKey.value++; // 强制重渲染弹窗
  showModal.value = true;
  // 强制触发响应式更新
  await nextTick();
  // 确保弹窗DOM元素获得焦点
  setTimeout(() => {
    const firstInput = document.querySelector('#drawer-modal input');
    if (firstInput) {
      (firstInput as HTMLInputElement).focus();
    }
  }, 50);
};

const closeModal = () => {
  showModal.value = false;
  editingDrawer.value = null;
  resetForm();
};

const editDrawer = (drawer: any) => {
  editingDrawer.value = drawer;
  Object.assign(form, {
    name: drawer.name,
    description: drawer.description,
    location_id: drawer.location_id,
    image_url: drawer.image_url,
  });
  showModal.value = true;
};

const saveDrawer = async () => {
  try {
    if (editingDrawer.value) {
      await drawerApi.update(editingDrawer.value.id, { ...form, image_data: form.image_url });
    } else {
      const response = await drawerApi.create({ ...form, image_data: form.image_url });
      const data = response.data || response;
      // 创建成功后显示二维码
      if (data.qrCodeImage) {
        qrCodeModal.value = {
          name: form.name,
          qrCodeImage: data.qrCodeImage,
        };
      }
    }
    await loadData();
    closeModal();
  } catch (error) {
    console.error("保存失败:", error);
    alert("保存失败");
  }
};

const confirmDialog = ref<InstanceType<typeof ConfirmDialog>>();
const deletingDrawerId = ref<number | null>(null);

const deleteDrawer = (id: number) => {
  deletingDrawerId.value = id;
  confirmDialog.value?.show();
};

const confirmDelete = async () => {
  if (!deletingDrawerId.value) return;

  try {
    await drawerApi.delete(deletingDrawerId.value);
    await loadData();
    deletingDrawerId.value = null;
  } catch (error) {
    console.error("删除失败:", error);
    alert("删除失败");
  }
};

const showQRCode = (drawer: any) => {
  qrCodeModal.value = drawer;
};

const closeQRModal = () => {
  qrCodeModal.value = null;
};

// 保留原有的打印方法作为备用
const printQRCode = () => {
  if (qrCodeModal.value?.qrCodeImage) {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const html = `
        <html>
          <head>
            <title>打印二维码 - ${qrCodeModal.value.name}</title>
            <style>
              body { text-align: center; padding: 20px; }
              img { max-width: 400px; }
              h2 { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h2>${qrCodeModal.value.name}</h2>
            <img src="${qrCodeModal.value.qrCodeImage}" />
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 100);
    }
  }
};

// 获取图片完整 URL
const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("data:")) return imageUrl;
  if (imageUrl.startsWith("http")) return imageUrl;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const shouldUseRuntime =
    typeof window !== "undefined" &&
    !import.meta.env.VITE_API_URL &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";
  const runtimeBase = typeof window !== "undefined" ? window.location.origin : "";
  const baseUrl = shouldUseRuntime ? runtimeBase : apiUrl.replace("/api", "");
  return `${baseUrl}${imageUrl}`;
};

onMounted(() => {
  loadData();
});
</script>
