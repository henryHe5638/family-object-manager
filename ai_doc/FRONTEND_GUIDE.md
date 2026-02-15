# 前端修改指南

## 🎯 核心改动概述

后端已完成所有改动，前端需要适配：
1. 用户角色和权限管理
2. 两级类目选择器  
3. 抽屉详情页物品操作
4. 到期提醒铃铛UI

---

## 1. API模块更新 (`frontend/src/api/modules.ts`)

```typescript
// 添加settings API
export const settingsApi = {
  getAll: () => api.get('/settings'),
  get: (key: string) => api.get(`/settings/${key}`),
  update: (key: string, value: string) => api.put(`/settings/${key}`, { value }),
  batchUpdate: (settings: Record<string, string>) => api.post('/settings/batch', settings),
};

// 修改category API - 支持两级结构
export const categoryApi = {
  getGroups: () => api.get('/categories/groups'),
  getGroupItems: (groupId: number) => api.get(`/categories/groups/${groupId}/items`),
  getAllItems: () => api.get('/categories/items'),
  searchItems: (q: string) => api.get(`/categories/items/search?q=${q}`),
  createGroup: (data: any) => api.post('/categories/groups', data),
  createItem: (data: any) => api.post('/categories/items', data),
};
```

---

## 2. Auth Store更新 (`frontend/src/stores/auth.ts`)

```typescript
// 添加role字段
const user = ref<User & { role?: string } | null>(null);

// 登录时存储role
const login = async (username: string, password: string) => {
  const response = await authApi.login({ username, password });
  token.value = response.token;
  user.value = response.user; // 包含role
  // ... 保存到localStorage
};

// 添加权限检查方法
const isAdmin = computed(() => user.value?.role === 'admin');

return {
  // ... 现有返回
  isAdmin,
};
```

---

## 3. 路由守卫 (`frontend/src/router/index.ts`)

```typescript
// 添加管理员路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    alert('需要管理员权限');
    next('/');
    return;
  }
  
  // ... 现有逻辑
});

// 标记需要管理员权限的路由
{
  path: '/users',
  name: 'Users',
  component: () => import('../views/Users.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
},
```

---

## 4. 导航菜单权限控制 (`frontend/src/components/Layout.vue`)

```vue
<template>
  <!-- 只有管理员能看到的菜单 -->
  <router-link 
    v-if="authStore.isAdmin" 
    to="/users"
  >
    用户管理
  </router-link>
  
  <!-- 删除按钮显示控制 -->
  <button 
    v-if="authStore.isAdmin"
    @click="deleteItem(id)"
  >
    删除
  </button>
</template>
```

---

## 5. 两级类目选择器组件 (`frontend/src/components/CategorySelector.vue`)

```vue
<template>
  <div class="category-selector">
    <!-- 大类选择 -->
    <select v-model="selectedGroup" @change="onGroupChange">
      <option value="">选择大类...</option>
      <option v-for="group in groups" :key="group.id" :value="group.id">
        {{ group.icon }} {{ group.name }}
      </option>
    </select>

    <!-- 物品选择/搜索 -->
    <div v-if="selectedGroup">
      <input
        v-model="searchQuery"
        @input="onSearch"
        placeholder="搜索或输入物品名..."
      />
      
      <div class="suggestions" v-if="showSuggestions">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          @click="selectItem(item)"
        >
          {{ item.name }}
        </div>
        
        <!-- 自定义选项 -->
        <div v-if="searchQuery && !exactMatch" @click="createCustom">
          + 添加新物品: {{ searchQuery }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { categoryApi } from '../api/modules';

const emit = defineEmits(['update:modelValue', 'select']);

const groups = ref([]);
const items = ref([]);
const selectedGroup = ref('');
const searchQuery = ref('');
const showSuggestions = ref(false);

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value;
  return items.value.filter((item: any) => 
    item.name.includes(searchQuery.value)
  );
});

const exactMatch = computed(() => {
  return items.value.some((item: any) => 
    item.name === searchQuery.value
  );
});

const onGroupChange = async () => {
  items.value = await categoryApi.getGroupItems(selectedGroup.value);
  searchQuery.value = '';
};

const selectItem = (item: any) => {
  emit('select', { 
    itemCategoryId: item.id, 
    name: item.name 
  });
  showSuggestions.value = false;
};

const createCustom = async () => {
  // 创建新物品类目
  const newItem = await categoryApi.createItem({
    name: searchQuery.value,
    group_id: selectedGroup.value
  });
  emit('select', { 
    itemCategoryId: newItem.id, 
    name: searchQuery.value 
  });
  showSuggestions.value = false;
};

onMounted(async () => {
  groups.value = await categoryApi.getGroups();
});
</script>
```

---

## 6. 抽屉详情页增强 (`frontend/src/views/DrawerDetail.vue`)

```vue
<template>
  <div>
    <!-- 添加物品按钮 -->
    <button @click="showAddModal = true">
      + 添加物品
    </button>

    <!-- 物品列表 - 添加编辑删除按钮 -->
    <div v-for="item in items" :key="item.id">
      <span>{{ item.name }}</span>
      <button @click="editItem(item)">编辑</button>
      <button @click="deleteItem(item.id)">删除</button>
    </div>

    <!-- 添加/编辑物品Modal -->
    <Modal v-if="showAddModal" @close="showAddModal = false">
      <h3>{{ editingItem ? '编辑' : '添加' }}物品</h3>
      
      <CategorySelector @select="onCategorySelect" />
      
      <input v-model="form.name" placeholder="物品名称" />
      <input v-model="form.quantity" type="number" placeholder="数量" />
      <input v-model="form.expiry_date" type="date" placeholder="到期日期" />
      
      <button @click="saveItem">保存</button>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { itemApi, drawerApi } from '../api/modules';
import CategorySelector from '../components/CategorySelector.vue';

const route = useRoute();
const items = ref([]);
const showAddModal = ref(false);
const editingItem = ref(null);
const form = ref({
  name: '',
  item_category_id: null,
  drawer_id: Number(route.params.id),
  quantity: 1,
  expiry_date: '',
});

const onCategorySelect = ({ itemCategoryId, name }: any) => {
  form.value.item_category_id = itemCategoryId;
  form.value.name = name;
};

const saveItem = async () => {
  if (editingItem.value) {
    await itemApi.update(editingItem.value.id, form.value);
  } else {
    await itemApi.create(form.value);
  }
  await loadItems();
  showAddModal.value = false;
};

const editItem = (item: any) => {
  editingItem.value = item;
  form.value = { ...item };
  showAddModal.value = true;
};

const deleteItem = async (id: number) => {
  if (confirm('确定删除？')) {
    await itemApi.delete(id);
    await loadItems();
  }
};

const loadItems = async () => {
  const drawer = await drawerApi.getById(route.params.id);
  items.value = drawer.items || [];
};

onMounted(loadItems);
</script>
```

---

## 7. 到期提醒铃铛 (`frontend/src/components/Layout.vue`)

```vue
<template>
  <header>
    <nav>
      <!-- 左侧：Logo和菜单 -->
      <div>...</div>

      <!-- 右侧：铃铛图标 -->
      <div class="flex items-center gap-4">
        <!-- 到期提醒铃铛 -->
        <div class="relative">
          <button 
            @click="showExpiryModal = true"
            class="relative p-2"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
              />
            </svg>
            
            <!-- 角标 -->
            <span 
              v-if="expiryCount > 0"
              class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ expiryCount > 99 ? '99+' : expiryCount }}
            </span>
          </button>

          <!-- 下拉提醒列表 -->
          <div 
            v-if="showExpiryDropdown"
            class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg"
          >
            <div class="p-4">
              <h3 class="font-bold mb-2">到期提醒</h3>
              <div v-if="expiringItems.length === 0" class="text-gray-500">
                暂无即将到期的物品
              </div>
              <div v-else>
                <div v-for="item in expiringItems" :key="item.id" class="py-2 border-b">
                  <div class="font-medium">{{ item.name }}</div>
                  <div class="text-sm text-gray-500">
                    {{ item.expiry_date }} 到期
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户信息 -->
        <div>{{ authStore.user?.username }}</div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { itemApi } from '../api/modules';

const authStore = useAuthStore();
const expiringItems = ref([]);
const expiredItems = ref([]);
const showExpiryModal = ref(false);
const showExpiryDropdown = ref(false);

const expiryCount = computed(() => {
  return expiringItems.value.length + expiredItems.value.length;
});

const loadExpiryData = async () => {
  const [expiring, expired] = await Promise.all([
    itemApi.getExpiring(30),
    itemApi.getExpired(),
  ]);
  
  expiringItems.value = expiring;
  expiredItems.value = expired;
};

onMounted(loadExpiryData);
</script>
```

---

## 8. 修改Items表单使用新类目选择器

在 `frontend/src/views/Items.vue` 中：

```vue
<template>
  <Modal v-if="showModal">
    <!-- 使用CategorySelector替代原来的category选择 -->
    <CategorySelector @select="onCategorySelect" />
    
    <!-- 其他字段... -->
  </Modal>
</template>

<script setup lang="ts">
const onCategorySelect = ({ itemCategoryId, name }: any) => {
  form.item_category_id = itemCategoryId;
  form.name = name; // 自动填充物品名
};
</script>
```

---

## 9. 注册页面添加注册限制提示

```vue
<template>
  <div v-if="registrationClosed" class="alert">
    当前不允许注册，请联系管理员
  </div>
  
  <form v-else @submit.prevent="handleRegister">
    <!-- 注册表单 -->
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { settingsApi } from '../api/modules';

const registrationClosed = ref(false);

onMounted(async () => {
  const setting = await settingsApi.get('allow_guest_register');
  registrationClosed.value = setting.value === 'false';
});
</script>
```

---

## 10. 系统设置页面（管理员）

创建 `frontend/src/views/Settings.vue`：

```vue
<template>
  <div class="container">
    <h1>系统设置</h1>
    
    <div class="setting-item">
      <label>允许游客注册</label>
      <input type="checkbox" v-model="allowRegister" />
    </div>
    
    <div class="setting-item">
      <label>网站URL</label>
      <input v-model="siteUrl" placeholder="http://localhost:5174" />
    </div>
    
    <button @click="saveSettings">保存设置</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { settingsApi } from '../api/modules';

const allowRegister = ref(true);
const siteUrl = ref('');

const loadSettings = async () => {
  const settings = await settingsApi.getAll();
  allowRegister.value = settings.allow_guest_register !== 'false';
  siteUrl.value = settings.site_url || '';
};

const saveSettings = async () => {
  await settingsApi.batchUpdate({
    allow_guest_register: allowRegister.value ? 'true' : 'false',
    site_url: siteUrl.value,
  });
  alert('设置已保存');
};

onMounted(loadSettings);
</script>
```

---

## 🔧 快速实施步骤

1. ✅ 后端已完成，重启生效
2. 更新API模块（modules.ts）
3. 更新Auth Store添加role
4. 创建CategorySelector组件
5. 修改Items/DrawerDetail使用新选择器
6. Layout添加铃铛图标
7. 添加路由守卫和UI权限控制
8. 测试所有功能

## ⚠️ 注意事项

- 旧数据不兼容，需清空重新注册
- 第一个用户自动成为管理员
- 二维码现在指向 `/drawers/:id` 而不是字符串
- 到期提醒只显示设置了到期日期的物品

---

## 🎉 完成后的新功能

1. ✅ 角色权限管理（admin/user）
2. ✅ 两级类目选择（大类->物品）
3. ✅ 200+内置常用物品
4. ✅ 抽屉页面直接管理物品
5. ✅ 二维码扫描跳转详情页
6. ✅ 铃铛式到期提醒
7. ✅ 注册开关配置
8. ✅ 网站URL配置

需要帮助实现具体组件时随时告诉我！
