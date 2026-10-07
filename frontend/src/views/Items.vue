<template>
  <Layout>
    <div class="px-4 sm:px-0">
      <div class="page-header">
        <h1 class="page-title">物品管理</h1>
        <button @click="openCreateModal" class="btn btn-primary">添加物品</button>
      </div>

      <!-- 筛选和排序 -->
      <div class="filter-bar">
        <div
          class="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between"
        >
          <div
            class="flex flex-col space-y-3 md:space-y-2 lg:space-y-0 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3"
          >
            <!-- 筛选：选一个类型 + 一个输入框 -->
            <div class="flex items-center space-x-2 min-w-0">
              <label class="form-label whitespace-nowrap !mb-0">筛选：</label>
              <select v-model="filterType" class="input-inline flex-1 sm:flex-none sm:w-28">
                <option value="all">全部字段</option>
                <option value="name">名称</option>
                <option value="brand">品牌</option>
                <option value="size">大小</option>
                <option value="category">类目</option>
                <option value="location">地点</option>
                <option value="drawer">抽屉</option>
                <option value="status">状态</option>
              </select>
              <select
                v-if="filterType === 'status'"
                v-model="filterValue"
                class="input-inline flex-1 sm:flex-none sm:w-36"
              >
                <option value="">全部</option>
                <option value="stored">在库</option>
                <option value="in_use">使用中</option>
                <option value="discarded">已丢弃</option>
              </select>
              <input
                v-else
                v-model="filterValue"
                type="text"
                class="input-inline flex-1 sm:flex-none sm:w-64"
                :placeholder="filterType === 'all' ? '模糊搜索所有字段...' : '输入要匹配的内容...'"
              />
              <button
                v-if="filterValue"
                @click="filterValue = ''"
                class="btn btn-ghost btn-sm shrink-0"
              >
                清空
              </button>
            </div>
            <!-- 排序（仅手机端显示；桌面端点击表头排序） -->
            <div class="flex sm:hidden items-center space-x-2">
              <label class="form-label whitespace-nowrap !mb-0">排序：</label>
              <select v-model="sortKey" class="input-inline flex-1">
                <option value="name">名称</option>
                <option value="brand">品牌</option>
                <option value="size">大小</option>
                <option value="quantity">数量</option>
                <option value="purchase_price">价格</option>
                <option value="purchase_date">购入时间</option>
                <option value="production_date">生产时间</option>
                <option value="expiry_date">到期时间</option>
                <option value="created_at">创建时间</option>
              </select>
              <button
                @click="sortOrder = -sortOrder"
                class="btn btn-secondary btn-sm shrink-0"
              >
                {{ sortOrder === 1 ? "↑" : "↓" }}
              </button>
            </div>
          </div>

          <!-- 视图切换 -->
          <div
            class="flex items-center justify-center sm:justify-start space-x-2 pt-3 sm:pt-0 sm:border-l sm:border-gray-200 sm:dark:border-gray-700 sm:pl-3"
          >
            <label class="form-label whitespace-nowrap !mb-0">视图：</label>
            <div class="flex space-x-1">
              <button
                @click="viewMode = 'list'"
                :class="viewMode === 'list' ? 'btn btn-primary' : 'btn btn-secondary'"
                aria-label="列表视图"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                @click="viewMode = 'grid'"
                :class="viewMode === 'grid' ? 'btn btn-primary' : 'btn btn-secondary'"
                aria-label="缩略图视图"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图：手机端卡片 / 平板及以上表格 -->
      <template v-if="viewMode === 'list'">
      <!-- 手机端卡片列表 -->
      <div class="sm:hidden space-y-3">
        <div v-for="item in filteredAndSortedItems" :key="item.id" class="card p-3">
          <router-link :to="`/items/${item.id}`" class="flex items-start gap-3">
            <img
              v-if="item.image_data || item.image_url"
              :src="getImageUrl(item.image_url, item.image_data)"
              alt="物品图片"
              class="h-20 w-20 object-contain rounded bg-gray-100 dark:bg-gray-700 shrink-0"
            />
            <div v-else class="h-20 w-20 bg-gray-200 rounded flex items-center justify-center shrink-0">
              <svg class="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <span class="font-medium text-lg text-gray-900 dark:text-white truncate">
                  {{ item.name }}
                  <span v-if="item.is_private" title="私人物品" class="cursor-default">🔒</span>
                </span>
                <span class="badge shrink-0" :class="getStatusMeta(item).badgeClass">
                  {{ getStatusMeta(item).text }}
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {{ [item.category_name, item.brand, item.size].filter(Boolean).join(" · ") || "-" }}
              </p>
              <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs mt-1.5">
                <span class="truncate text-gray-600 dark:text-gray-400">数量 x{{ item.quantity }}</span>
                <span
                  class="truncate"
                  :class="item.purchase_price ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'"
                >
                  价格 {{ item.purchase_price ? `¥${item.purchase_price}` : "-" }}
                </span>
                <span class="truncate text-gray-600 dark:text-gray-400">购买 {{ item.purchase_date || "-" }}</span>
                <span class="truncate text-gray-600 dark:text-gray-400">生产 {{ item.production_date || "-" }}</span>
                <span class="truncate text-gray-600 dark:text-gray-400">地点 {{ item.location_name || "-" }}</span>
                <span class="truncate text-gray-600 dark:text-gray-400">抽屉 {{ item.drawer_name || "-" }}</span>
                <span v-if="item.creator_name" class="truncate text-gray-600 dark:text-gray-400">
                  创建人 {{ item.creator_name }}
                </span>
                <span v-if="item.expiry_date" class="truncate" :class="getExpiryClass(item.expiry_date)">
                  到期 {{ item.expiry_date }}
                </span>
              </div>
            </div>
          </router-link>
          <div class="flex space-x-2 mt-3">
            <router-link :to="`/items/${item.id}`" class="btn btn-primary btn-sm flex-1">查看</router-link>
            <button @click="showItemQRCode(item)" class="btn btn-secondary btn-sm flex-1">二维码</button>
            <button @click="editItem(item)" class="btn btn-secondary btn-sm flex-1">编辑</button>
            <button @click="deleteItem(item.id)" class="btn btn-danger btn-sm flex-1">删除</button>
          </div>
        </div>
      </div>

      <!-- 平板及以上表格 -->
      <div class="card hidden sm:block">
        <div class="overflow-x-auto scroll-thin">
          <div class="min-w-[2200px]">
            <table class="min-w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="th-cell w-32">图片</th>
                  <th class="th-cell w-40 sortable-th" :class="sortKey === 'name' && 'th-sorted'" @click="toggleSort('name')">名称<SortArrow :active="sortKey === 'name'" :order="sortOrder" /></th>
                  <th class="th-cell w-52 sortable-th hidden 2xl:table-cell" :class="sortKey === 'description' && 'th-sorted'" @click="toggleSort('description')">描述<SortArrow :active="sortKey === 'description'" :order="sortOrder" /></th>
                  <th class="th-cell sortable-th hidden md:table-cell" :class="sortKey === 'category_name' && 'th-sorted'" @click="toggleSort('category_name')">类目<SortArrow :active="sortKey === 'category_name'" :order="sortOrder" /></th>
                  <th class="th-cell sortable-th hidden xl:table-cell" :class="sortKey === 'brand' && 'th-sorted'" @click="toggleSort('brand')">品牌<SortArrow :active="sortKey === 'brand'" :order="sortOrder" /></th>
                  <th class="th-cell sortable-th hidden xl:table-cell" :class="sortKey === 'size' && 'th-sorted'" @click="toggleSort('size')">大小<SortArrow :active="sortKey === 'size'" :order="sortOrder" /></th>
                  <th class="th-cell sortable-th hidden sm:table-cell" :class="sortKey === 'location_name' && 'th-sorted'" @click="toggleSort('location_name')">地点<SortArrow :active="sortKey === 'location_name'" :order="sortOrder" /></th>
                  <th class="th-cell sortable-th hidden xl:table-cell" :class="sortKey === 'drawer_name' && 'th-sorted'" @click="toggleSort('drawer_name')">抽屉<SortArrow :active="sortKey === 'drawer_name'" :order="sortOrder" /></th>
                  <th class="th-cell sortable-th hidden lg:table-cell" :class="sortKey === 'quantity' && 'th-sorted'" @click="toggleSort('quantity')">数量<SortArrow :active="sortKey === 'quantity'" :order="sortOrder" /></th>
                  <th class="th-cell sortable-th hidden lg:table-cell" :class="sortKey === 'purchase_price' && 'th-sorted'" @click="toggleSort('purchase_price')">价格<SortArrow :active="sortKey === 'purchase_price'" :order="sortOrder" /></th>
                  <th class="th-cell sortable-th hidden 2xl:table-cell" :class="sortKey === 'purchase_date' && 'th-sorted'" @click="toggleSort('purchase_date')">购买日期<SortArrow :active="sortKey === 'purchase_date'" :order="sortOrder" /></th>
                  <th class="th-cell sortable-th hidden 2xl:table-cell" :class="sortKey === 'production_date' && 'th-sorted'" @click="toggleSort('production_date')">生产日期<SortArrow :active="sortKey === 'production_date'" :order="sortOrder" /></th>
                  <th class="th-cell sortable-th hidden 2xl:table-cell" :class="sortKey === 'expiry_date' && 'th-sorted'" @click="toggleSort('expiry_date')">到期日期<SortArrow :active="sortKey === 'expiry_date'" :order="sortOrder" /></th>
                  <th class="th-cell sortable-th hidden md:table-cell" :class="sortKey === 'status' && 'th-sorted'" @click="toggleSort('status')">状态<SortArrow :active="sortKey === 'status'" :order="sortOrder" /></th>
                  <th class="th-cell sortable-th hidden 2xl:table-cell" :class="sortKey === 'creator_name' && 'th-sorted'" @click="toggleSort('creator_name')">创建人<SortArrow :active="sortKey === 'creator_name'" :order="sortOrder" /></th>
                  <th class="th-cell w-80">操作</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="item in filteredAndSortedItems" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-2 py-4 text-center">
                    <router-link :to="`/items/${item.id}`" class="inline-block align-middle">
                      <img
                        v-if="item.image_data || item.image_url"
                        :src="getImageUrl(item.image_url, item.image_data)"
                        alt="物品图片"
                        title="点击查看详情"
                        class="h-24 w-24 object-contain rounded bg-gray-100 dark:bg-gray-700"
                      />
                      <div v-else class="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </router-link>
                  </td>
                  <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900 dark:text-white overflow-hidden text-ellipsis">
                    <router-link :to="`/items/${item.id}`" class="hover:text-blue-600 dark:hover:text-blue-400">
                      {{ item.name }}
                    </router-link>
                    <span v-if="item.is_private" title="私人物品" class="ml-1 cursor-default">🔒</span>
                  </td>
                  <td class="td-cell hidden 2xl:table-cell">
                    <span class="block max-w-[200px] truncate" :title="item.description">{{ item.description || "-" }}</span>
                  </td>
                  <td class="td-cell hidden md:table-cell">{{ item.category_name || "-" }}</td>
                  <td class="td-cell hidden xl:table-cell">{{ item.brand || "-" }}</td>
                  <td class="td-cell hidden xl:table-cell">{{ item.size || "-" }}</td>
                  <td class="td-cell hidden sm:table-cell">{{ item.location_name || "-" }}</td>
                  <td class="td-cell hidden xl:table-cell">{{ item.drawer_name || "-" }}</td>
                  <td class="td-cell hidden lg:table-cell">{{ item.quantity }}</td>
                  <td class="td-cell hidden lg:table-cell">{{ item.purchase_price ? `¥${item.purchase_price}` : "-" }}</td>
                  <td class="td-cell hidden 2xl:table-cell">{{ item.purchase_date || "-" }}</td>
                  <td class="td-cell hidden 2xl:table-cell">{{ item.production_date || "-" }}</td>
                  <td class="td-cell hidden 2xl:table-cell" :class="getExpiryClass(item.expiry_date)">
                    {{ item.expiry_date || "-" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center hidden md:table-cell">
                    <span class="badge" :class="getStatusMeta(item).badgeClass">
                      {{ getStatusMeta(item).text }}
                    </span>
                  </td>
                  <td class="td-cell hidden 2xl:table-cell">{{ item.creator_name || "-" }}</td>
                  <td class="px-2 py-4 whitespace-nowrap text-sm font-medium text-center overflow-hidden">
                    <!-- 桌面端：单行不换行，避免撑高行 -->
                    <div class="hidden sm:flex items-center justify-center">
                      <router-link :to="`/items/${item.id}`" class="link-btn link-primary">查看</router-link>
                      <button
                        v-if="(item.status || 'stored') !== 'in_use'"
                        @click="markStatus(item, 'in_use')"
                        class="link-btn link-success"
                      >
                        使用
                      </button>
                      <button
                        v-if="(item.status || 'stored') !== 'discarded'"
                        @click="discardItem(item)"
                        class="link-btn link-warning"
                      >
                        丢弃
                      </button>
                      <button
                        v-if="(item.status || 'stored') === 'discarded'"
                        @click="markStatus(item, 'stored')"
                        class="link-btn link-neutral"
                      >
                        恢复
                      </button>
                      <button @click="showItemQRCode(item)" class="link-btn link-success">二维码</button>
                      <button @click="editItem(item)" class="link-btn link-neutral">编辑</button>
                      <button @click="deleteItem(item.id)" class="link-btn link-danger">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </template>

      <!-- 缩略图视图 -->
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <div
          v-for="item in filteredAndSortedItems"
          :key="item.id"
          class="card hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <router-link :to="`/items/${item.id}`" class="block">
            <div class="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
              <img
                v-if="item.image_data || item.image_url"
                :src="getImageUrl(item.image_url, item.image_data)"
                :alt="item.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div class="p-3">
              <div class="flex items-center justify-between gap-1 mb-1">
                <h3 class="font-medium text-gray-900 dark:text-white text-sm truncate">
                  {{ item.name }}
                  <span v-if="item.is_private" title="私人物品" class="cursor-default">🔒</span>
                </h3>
                <span class="badge shrink-0" :class="getStatusMeta(item).badgeClass">
                  {{ getStatusMeta(item).text }}
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ item.category_name || "-" }}
              </p>
              <div class="mt-2 flex items-center justify-between text-xs">
                <span class="text-gray-600 dark:text-gray-400">x{{ item.quantity }}</span>
                <span v-if="item.purchase_price" class="text-blue-600 dark:text-blue-400 font-medium">¥{{ item.purchase_price }}</span>
              </div>
              <div
                v-if="item.expiry_date"
                class="mt-1 text-xs"
                :class="getExpiryClass(item.expiry_date)"
              >
                {{ item.expiry_date }}
              </div>
            </div>
          </router-link>
          <div class="px-3 pb-3 flex gap-2">
            <button @click.stop="editItem(item)" class="btn btn-secondary btn-sm flex-1">编辑</button>
            <button @click.stop="deleteItem(item.id)" class="btn btn-danger btn-sm flex-1">删除</button>
          </div>
        </div>
      </div>

      <!-- 添加/编辑物品弹窗（共享组件） -->
      <ItemFormModal
        :show="showModal"
        :item="editingItem"
        @close="closeModal"
        @saved="loadData"
      />

      <!-- 确认删除对话框 -->
      <ConfirmDialog
        ref="confirmDialog"
        title="删除物品"
        message="确定要删除这个物品吗？删除后无法恢复。"
        type="danger"
        @confirm="confirmDelete"
      />

      <!-- 确认丢弃对话框 -->
      <ConfirmDialog
        ref="discardDialog"
        title="丢弃物品"
        message="确定要丢弃这个物品吗？标记后物品将进入「已丢弃」状态，可在筛选中查看或恢复。"
        type="danger"
        @confirm="confirmDiscard"
      />

      <!-- 二维码查看弹窗 -->
      <BaseModal
        :show="!!qrCodeModal"
        :title="qrCodeModal ? `${qrCodeModal.name} 的二维码` : ''"
        max-width="max-w-md"
        @close="closeQRModal"
      >
        <QRCodeDisplay
          v-if="qrCodeModal"
          :item-id="qrCodeModal.id"
          :item-name="qrCodeModal.name"
        />
        <div class="flex justify-end mt-4">
          <button type="button" @click="closeQRModal" class="btn btn-secondary">关闭</button>
        </div>
      </BaseModal>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import Layout from "../components/Layout.vue";
import BaseModal from "../components/BaseModal.vue";
import ItemFormModal from "../components/ItemFormModal.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import { itemApi, locationApi, drawerApi } from "../api/modules";
import QRCodeDisplay from "../components/QRCodeDisplay.vue";
import { h, defineComponent } from "vue";

// 表头排序箭头指示器
const SortArrow = defineComponent({
  props: {
    active: { type: Boolean, default: false },
    order: { type: Number, default: 1 },
  },
  setup(props) {
    return () =>
      h(
        "span",
        {
          class: props.active ? "text-blue-600 dark:text-blue-400 font-bold" : "text-gray-300 dark:text-gray-600",
          style: "margin-left:2px;font-size:10px",
        },
        props.active ? (props.order === 1 ? "▲" : "▼") : "↕"
      );
  },
});

const items = ref<any[]>([]);
const locations = ref<any[]>([]);
const drawers = ref<any[]>([]);
const showModal = ref(false);
const editingItem = ref<any>(null);

// 筛选和排序（状态持久化到 localStorage，刷新后保留）
const FILTER_STATE_KEY = "items-filter-state";
const savedFilterState = (() => {
  try {
    return JSON.parse(localStorage.getItem(FILTER_STATE_KEY) || "null");
  } catch {
    return null;
  }
})();

const filterType = ref<string>(savedFilterState?.filterType || "all"); // all/name/brand/size/category/location/drawer/status
const filterValue = ref<string>(savedFilterState?.filterValue || ""); // 筛选内容（status 类型时为状态码）
const sortKey = ref<string>(savedFilterState?.sortKey || "name");
const sortOrder = ref<number>(savedFilterState?.sortOrder ?? 1); // 1 asc, -1 desc
const viewMode = ref<"list" | "grid">(savedFilterState?.viewMode || "list");

// 筛选/排序/视图变化时自动保存
watch([filterType, filterValue, sortKey, sortOrder, viewMode], () => {
  localStorage.setItem(
    FILTER_STATE_KEY,
    JSON.stringify({
      filterType: filterType.value,
      filterValue: filterValue.value,
      sortKey: sortKey.value,
      sortOrder: sortOrder.value,
      viewMode: viewMode.value,
    })
  );
});

// 物品状态展示配置
const STATUS_META: Record<string, { text: string; badgeClass: string }> = {
  stored: { text: "在库", badgeClass: "badge-gray" },
  in_use: { text: "使用中", badgeClass: "badge-green" },
  discarded: { text: "已丢弃", badgeClass: "badge-red" },
};

const getStatusMeta = (item: any): { text: string; badgeClass: string } => {
  return STATUS_META[item.status || "stored"] || STATUS_META.stored!;
};

const getExpiryClass = (expiryDate: string) => {
  if (!expiryDate) return "text-gray-500";
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.floor(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) return "text-red-600 font-medium";
  if (diffDays <= 30) return "text-yellow-600 font-medium";
  return "text-gray-500";
};

const loadData = async () => {
  try {
    const [itemsRes, locationsRes, drawersRes] =
      await Promise.all([
        itemApi.getAll(),
        locationApi.getAll(),
        drawerApi.getAll(),
      ]);

    items.value = itemsRes.data || itemsRes;
    locations.value = locationsRes.data || locationsRes;
    drawers.value = drawersRes.data || drawersRes;
  } catch (error) {
    console.error("加载数据失败:", error);
  }
};

// 切换筛选类型时清空已输入内容
watch(filterType, () => {
  filterValue.value = "";
});

// 点击表头排序：同列再次点击切换方向
const toggleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = -sortOrder.value;
  } else {
    sortKey.value = key;
    sortOrder.value = 1;
  }
};

// 筛选和排序逻辑
const filteredAndSortedItems = computed(() => {
  let list = [...items.value];

  // 筛选：单框 + 类型
  const fv = filterValue.value.trim();
  if (fv) {
    if (filterType.value === "status") {
      list = list.filter((item) => (item.status || "stored") === fv);
    } else if (filterType.value === "all") {
      // 全部字段模糊匹配
      const q = fv.toLowerCase();
      list = list.filter((item) =>
        [
          item.name,
          item.brand,
          item.size,
          item.category_name,
          item.location_name,
          item.drawer_name,
        ]
          .filter(Boolean)
          .some((field) => field.toString().toLowerCase().includes(q))
      );
    } else {
      // 指定字段包含匹配
      const fieldMap: Record<string, string> = {
        name: "name",
        brand: "brand",
        size: "size",
        category: "category_name",
        location: "location_name",
        drawer: "drawer_name",
      };
      const field = fieldMap[filterType.value]!;
      const q = fv.toLowerCase();
      list = list.filter((item) =>
        (item[field] || "").toString().toLowerCase().includes(q)
      );
    }
  }

  // 排序：数字字段按数值，其余按中文本地化字符串
  const numericKeys = ["quantity", "purchase_price"];
  list.sort((a, b) => {
    let result: number;
    if (numericKeys.includes(sortKey.value)) {
      result = (Number(a[sortKey.value]) || 0) - (Number(b[sortKey.value]) || 0);
    } else {
      result = (a[sortKey.value] || "")
        .toString()
        .localeCompare((b[sortKey.value] || "").toString(), "zh-CN");
    }
    return result * sortOrder.value;
  });

  return list;
});

const openCreateModal = () => {
  editingItem.value = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingItem.value = null;
};

const editItem = (item: any) => {
  editingItem.value = item;
  showModal.value = true;
};

// 获取图片完整 URL
const getImageUrl = (imageUrl: string, imageData?: string) => {
  // 优先使用 image_data (Base64)
  if (imageData && imageData.startsWith('data:')) return imageData;
  if (!imageUrl) return "";
  // 如果是 Base64，直接返回
  if (imageUrl.startsWith('data:')) return imageUrl;
  // 如果是完整 URL，直接返回
  if (imageUrl.startsWith("http")) return imageUrl;
  // 兼容旧数据：拼接路径
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

const confirmDialog = ref<InstanceType<typeof ConfirmDialog>>();
const deletingItemId = ref<number | null>(null);

const deleteItem = (id: number) => {
  deletingItemId.value = id;
  confirmDialog.value?.show();
};

const confirmDelete = async () => {
  if (!deletingItemId.value) return;

  try {
    await itemApi.delete(deletingItemId.value);
    await loadData();
    deletingItemId.value = null;
  } catch (error) {
    console.error("删除失败:", error);
    alert("删除失败");
  }
};

// 标记使用/丢弃/恢复
const markStatus = async (item: any, status: string) => {
  try {
    await itemApi.updateStatus(item.id, status);
    await loadData();
  } catch (error) {
    console.error("更新状态失败:", error);
    alert("更新状态失败");
  }
};

const discardDialog = ref<InstanceType<typeof ConfirmDialog>>();
const discardingItem = ref<any>(null);

const discardItem = (item: any) => {
  discardingItem.value = item;
  discardDialog.value?.show();
};

const confirmDiscard = async () => {
  if (!discardingItem.value) return;
  await markStatus(discardingItem.value, "discarded");
  discardingItem.value = null;
};

// 二维码相关
const qrCodeModal = ref<any>(null);

const showItemQRCode = (item: any) => {
  qrCodeModal.value = item;
};

const closeQRModal = () => {
  qrCodeModal.value = null;
};

onMounted(() => {
  loadData();
});
</script>
