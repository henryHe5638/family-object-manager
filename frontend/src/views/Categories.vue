<template>
  <Layout>
    <div class="px-4 sm:px-0">
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">类目管理</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">两级类目：大类（如食品）→ 物品（如大葱）</p>
        </div>
        <div class="mt-4 sm:mt-0">
          <button
            v-if="authStore.isAdmin"
            @click="openGroupModal()"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            添加大类
          </button>
        </div>
      </div>

      <!-- 类目分组卡片 -->
      <div class="space-y-6">
        <div
          v-for="group in groups"
          :key="group.id"
          class="bg-white shadow rounded-lg overflow-hidden"
        >
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ group.name }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ group.description || '无描述' }}</p>
            </div>
            <div class="flex space-x-2">
              <button
                @click="openItemModal(group.id)"
                class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                新增物品
              </button>
              <button
                v-if="authStore.isAdmin"
                @click="openGroupModal(group)"
                class="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                编辑大类
              </button>
              <button
                v-if="authStore.isAdmin"
                @click="deleteGroup(group.id)"
                class="px-3 py-1 text-sm bg-white border border-red-300 text-red-600 rounded hover:bg-red-50"
              >
                删除大类
              </button>
            </div>
          </div>
          
          <div class="px-6 py-4">
            <div v-if="group.items && group.items.length > 0" class="flex flex-wrap gap-2">
              <div
                v-for="item in group.items"
                :key="item.id"
                class="inline-flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group"
              >
                <span>{{ item.name }}</span>
                <button
                  @click="openItemModal(group.id, item)"
                  class="ml-2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="编辑物品"
                >
                  ✏️
                </button>
                <button
                  @click="deleteItem(item.id)"
                  class="ml-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="删除物品"
                >
                  ✖️
                </button>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              此大类下暂无物品类目，点击上方“新增物品”按钮添加
            </div>
          </div>
        </div>

        <div v-if="groups.length === 0" class="text-center py-12 bg-white dark:bg-gray-800 shadow rounded-lg">
          <p class="text-gray-500 dark:text-gray-400">暂无类目数据</p>
        </div>
      </div>

      <!-- 添加/编辑大类弹窗 -->
      <div v-if="showGroupModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeGroupModal">
        <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800" @click.stop>
          <h3 class="text-lg font-medium mb-4 text-gray-900 dark:text-white">{{ editingGroup ? '编辑大类' : '添加大类' }}</h3>
          <form @submit.prevent="saveGroup" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">大类名称 *</label>
              <input
                v-model="groupForm.name"
                required
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="如: 食品🍎"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">描述</label>
              <textarea
                v-model="groupForm.description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="大类的简单描述"
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                @click="closeGroupModal"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                type="submit"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 添加/编辑物品类目弹窗 -->
      <div v-if="showItemModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeItemModal">
        <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800" @click.stop>
          <h3 class="text-lg font-medium mb-4 text-gray-900 dark:text-white">{{ editingItem ? '编辑物品类目' : '添加物品类目' }}</h3>
          <form @submit.prevent="saveItem" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">选择大类 *</label>
              <select
                v-model="itemForm.group_id"
                required
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option :value="null">请选择大类</option>
                <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">物品名称 *</label>
              <input
                v-model="itemForm.name"
                required
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="如: 大葱"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">描述</label>
              <textarea
                v-model="itemForm.description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="物品的简单描述"
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                @click="closeItemModal"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                type="submit"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 确认删除对话框 -->
      <ConfirmDialog
        ref="confirmDialog"
        :title="deleteTarget === 'group' ? '删除大类' : '删除物品类目'"
        :message="deleteTarget === 'group' ? '确定要删除这个大类吗？删除后会同时删除其下的所有物品类目，此操作无法撤销！' : '确定要删除这个物品类目吗？此操作无法撤销！'"
        type="danger"
        @confirm="confirmDelete"
      />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import Layout from '../components/Layout.vue';
import { categoryApi } from '../api/modules';
import { useAuthStore } from '../stores/auth';
import ConfirmDialog from '../components/ConfirmDialog.vue';

const authStore = useAuthStore();
const groups = ref<any[]>([]);
const showGroupModal = ref(false);
const showItemModal = ref(false);
const editingGroup = ref<any>(null);
const editingItem = ref<any>(null);
const confirmDialog = ref<InstanceType<typeof ConfirmDialog>>();
const deletingId = ref<number | null>(null);
const deleteTarget = ref<'group' | 'item'>('group');

const groupForm = reactive({
  name: '',
  description: '',
});

const itemForm = reactive({
  group_id: null as number | null,
  name: '',
  description: '',
});

const loadGroups = async () => {
  try {
    const response = await categoryApi.getGroups();
    const data = response.data || response;
    // 为每个组加载其物品
    for (const group of data) {
      const items = await categoryApi.getGroupItems(group.id);
      group.items = items.data || items;
    }
    groups.value = data;
  } catch (error) {
    console.error('加载类目失败:', error);
  }
};

// 大类管理
const openGroupModal = (group?: any) => {
  if (group) {
    editingGroup.value = group;
    groupForm.name = group.name;
    groupForm.description = group.description || '';
  } else {
    editingGroup.value = null;
    groupForm.name = '';
    groupForm.description = '';
  }
  showGroupModal.value = true;
};

const closeGroupModal = () => {
  showGroupModal.value = false;
  editingGroup.value = null;
  groupForm.name = '';
  groupForm.description = '';
};

const saveGroup = async () => {
  try {
    if (editingGroup.value) {
      await categoryApi.updateGroup(editingGroup.value.id, groupForm);
    } else {
      await categoryApi.createGroup(groupForm);
    }
    await loadGroups();
    closeGroupModal();
  } catch (error: any) {
    console.error('保存大类失败:', error);
    alert(error.response?.data?.error || '保存大类失败');
  }
};

const deleteGroup = async (id: number) => {
  deletingId.value = id;
  deleteTarget.value = 'group';
  confirmDialog.value?.show();
};

const deleteItem = async (id: number) => {
  deletingId.value = id;
  deleteTarget.value = 'item';
  confirmDialog.value?.show();
};

const confirmDelete = async () => {
  if (!deletingId.value) return;
  
  try {
    if (deleteTarget.value === 'group') {
      await categoryApi.deleteGroup(deletingId.value);
    } else {
      await categoryApi.deleteItem(deletingId.value);
    }
    await loadGroups();
    deletingId.value = null;
  } catch (error: any) {
    console.error('删除失败:', error);
    alert(error.response?.data?.error || '删除失败');
  }
};

// 物品类目管理
const openItemModal = (groupId?: number, item?: any) => {
  if (item) {
    editingItem.value = item;
    itemForm.group_id = item.group_id;
    itemForm.name = item.name;
    itemForm.description = item.description || '';
  } else {
    editingItem.value = null;
    itemForm.group_id = groupId || null;
    itemForm.name = '';
    itemForm.description = '';
  }
  showItemModal.value = true;
};

const closeItemModal = () => {
  showItemModal.value = false;
  editingItem.value = null;
  itemForm.group_id = null;
  itemForm.name = '';
  itemForm.description = '';
};

const saveItem = async () => {
  try {
    if (editingItem.value) {
      await categoryApi.updateItem(editingItem.value.id, itemForm);
    } else {
      await categoryApi.createItem(itemForm);
    }
    await loadGroups();
    closeItemModal();
  } catch (error: any) {
    console.error('保存物品类目失败:', error);
    alert(error.response?.data?.error || '保存物品类目失败');
  }
};

onMounted(() => {
  loadGroups();
});
</script>
