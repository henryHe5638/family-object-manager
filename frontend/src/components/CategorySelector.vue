<template>
  <div class="space-y-4">
    <!-- 大类选择 -->
    <div>
      <label class="form-label">选择大类</label>
      <select
        v-model="selectedGroup"
        @change="onGroupChange"
        class="input mt-1"
      >
        <option value="">请选择大类...</option>
        <option v-for="group in groups" :key="group.id" :value="group.id">
          {{ group.icon }} {{ group.name }}
        </option>
      </select>
    </div>

    <!-- 物品搜索/选择 -->
    <div v-if="selectedGroup">
      <label class="form-label">物品名称</label>
      <div class="relative">
        <input
          v-model="searchQuery"
          @input="onSearch"
          @focus="showSuggestions = true"
          @blur="onBlur"
          placeholder="搜索或输入物品名称..."
          class="input mt-1"
        />

        <!-- 下拉建议列表 -->
        <div
          v-if="showSuggestions && (filteredItems.length > 0 || searchQuery)"
          class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <div
            v-for="item in filteredItems"
            :key="item.id"
            @mousedown="selectItem(item)"
            class="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/50 cursor-pointer"
          >
            {{ item.name }}
          </div>

          <!-- 自定义新增选项 -->
          <div
            v-if="searchQuery && !exactMatch"
            @mousedown="createCustom"
            class="px-3 py-2 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 cursor-pointer border-t border-gray-200 dark:border-gray-600 text-green-700 dark:text-green-300"
          >
            <span class="font-medium">+ 添加新物品:</span> {{ searchQuery }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { categoryApi } from '../api/modules';

interface CategoryGroup {
  id: number;
  name: string;
  icon: string;
}

interface ItemCategory {
  id: number;
  name: string;
  group_id: number;
}

const emit = defineEmits<{
  select: [data: { itemCategoryId: number; name: string }]
}>();

const props = defineProps<{
  initialCategoryId?: number | null;
}>();

const groups = ref<CategoryGroup[]>([]);
const items = ref<ItemCategory[]>([]);
const selectedGroup = ref<string>('');
const searchQuery = ref('');
const showSuggestions = ref(false);

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value.slice(0, 20);
  return items.value.filter((item: ItemCategory) => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  ).slice(0, 20);
});

const exactMatch = computed(() => {
  return items.value.some((item: ItemCategory) => 
    item.name.toLowerCase() === searchQuery.value.toLowerCase()
  );
});

const onGroupChange = async () => {
  if (!selectedGroup.value) {
    items.value = [];
    return;
  }
  try {
    const response = await categoryApi.getGroupItems(Number(selectedGroup.value));
    items.value = response.data || response;
    searchQuery.value = '';
  } catch (error) {
    console.error('加载物品列表失败:', error);
    alert('加载物品列表失败');
  }
};

const onSearch = () => {
  showSuggestions.value = true;
};

const onBlur = () => {
  // 延迟关闭以允许点击事件触发
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const selectItem = (item: ItemCategory) => {
  searchQuery.value = item.name;
  showSuggestions.value = false;
  emit('select', { 
    itemCategoryId: item.id, 
    name: item.name 
  });
};

const createCustom = async () => {
  try {
    const response = await categoryApi.createItem({
      name: searchQuery.value,
      group_id: selectedGroup.value,
      description: `${groups.value.find(g => g.id === Number(selectedGroup.value))?.name} - ${searchQuery.value}`
    });
    const newItem = response.data || response;
    
    showSuggestions.value = false;
    emit('select', { 
      itemCategoryId: newItem.id, 
      name: searchQuery.value 
    });
    
    // 重新加载物品列表
    await onGroupChange();
  } catch (error) {
    console.error('创建物品类目失败:', error);
    alert('创建物品类目失败');
  }
};

// 根据已保存的类目 id 恢复选中状态（编辑场景）
const restoreSelection = async (categoryId: number) => {
  try {
    const response = await categoryApi.getAllItems();
    const all: ItemCategory[] = response.data || response;
    const category = all.find((c) => c.id === categoryId);
    if (!category) return;
    selectedGroup.value = String(category.group_id);
    const groupRes = await categoryApi.getGroupItems(category.group_id);
    items.value = groupRes.data || groupRes;
    searchQuery.value = category.name;
    emit('select', { itemCategoryId: category.id, name: category.name });
  } catch (error) {
    console.error('恢复类目选择失败:', error);
  }
};

const clearSelection = () => {
  selectedGroup.value = '';
  items.value = [];
  searchQuery.value = '';
};

// 初始化时加载大类
onMounted(async () => {
  try {
    const response = await categoryApi.getGroups();
    groups.value = response.data || response;
    // 有初始类目时回显选择
    if (props.initialCategoryId) {
      await restoreSelection(props.initialCategoryId);
    }
  } catch (error) {
    console.error('加载大类失败:', error);
  }
});

// 外部传入的类目变化时同步（如编辑弹窗赋值）
watch(() => props.initialCategoryId, (id) => {
  if (id) {
    restoreSelection(id);
  } else {
    clearSelection();
  }
});
</script>

<style scoped>
/* 可选：添加一些自定义样式 */
</style>
