<template>
  <Layout>
    <div class="px-4 sm:px-0">
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">物品管理</h1>
        <button
          @click="openCreateModal"
          class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          添加物品
        </button>
      </div>

      <!-- 筛选和排序 -->
      <div class="mb-4 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
        <div
          class="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between"
        >
          <div
            class="flex flex-col space-y-3 md:space-y-2 lg:space-y-0 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3"
          >
            <div class="flex items-center space-x-2 min-w-0">
              <label class="text-sm font-medium text-gray-700 whitespace-nowrap"
                >类目：</label
              >
              <select
                v-model="filterCategoryId"
                class="flex-1 sm:flex-none min-w-0 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-2 sm:px-3 py-2 border"
              >
                <option :value="null">全部</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="flex items-center space-x-2 min-w-0">
              <label class="text-sm font-medium text-gray-700 whitespace-nowrap"
                >地点：</label
              >
              <select
                v-model="filterLocationId"
                class="flex-1 sm:flex-none min-w-0 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-2 sm:px-3 py-2 border"
              >
                <option :value="null">全部</option>
                <option v-for="loc in locations" :key="loc.id" :value="loc.id">
                  {{ loc.name }}
                </option>
              </select>
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700 whitespace-nowrap"
                >抽屉：</label
              >
              <select
                v-model="filterDrawerId"
                class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border"
              >
                <option :value="null">全部</option>
                <option
                  v-for="drawer in drawers"
                  :key="drawer.id"
                  :value="drawer.id"
                >
                  {{ drawer.name }}
                </option>
              </select>
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700 whitespace-nowrap"
                >排序：</label
              >
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
                @click="setSort('expiry_date')"
                :class="[
                  'px-3 py-2 text-sm rounded-md border',
                  sortKey === 'expiry_date'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                ]"
              >
                到期
              </button>
            </div>
          </div>

          <!-- 视图切换 -->
          <div
            class="flex items-center justify-center sm:justify-start space-x-2 pt-3 sm:pt-0 sm:border-l sm:pl-3"
          >
            <label class="text-sm font-medium text-gray-700 whitespace-nowrap"
              >视图：</label
            >
            <div class="flex space-x-1">
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
      </div>

      <!-- 列表视图 -->
      <div
        v-if="viewMode === 'list'"
        class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
      >
        <div class="overflow-x-auto">
          <div class="min-w-[800px]">
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
                  类目
                </th>
                <th
                  class="hidden sm:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  地点
                </th>
                <th
                  class="hidden lg:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  数量
                </th>
                <th
                  class="hidden lg:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  价格
                </th>
                <th
                  class="hidden xl:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  到期日期
                </th>
                <th
                  class="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="item in filteredAndSortedItems" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
                  <img
                    v-if="item.image_data || item.image_data || item.image_url"
                    :src="getImageUrl(item.image_url, item.image_data)"
                    alt="物品图片"
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
                  {{ item.name }}
                </td>
                <td
                  class="hidden md:table-cell px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-300"
                >
                  {{ item.category_name || "-" }}
                </td>
                <td
                  class="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-300"
                >
                  {{ item.location_name || "-" }}
                </td>
                <td
                  class="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-300"
                >
                  {{ item.quantity }}
                </td>
                <td
                  class="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-300"
                >
                  {{ item.purchase_price ? `¥${item.purchase_price}` : "-" }}
                </td>
                <td
                  class="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-center text-sm"
                  :class="getExpiryClass(item.expiry_date)"
                >
                  {{ item.expiry_date || "-" }}
                </td>
                <td
                  class="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-center"
                >
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <router-link
                      :to="`/items/${item.id}`"
                      class="px-2 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-xs sm:text-sm"
                      >查看</router-link
                    >
                    <button
                      @click="showItemQRCode(item)"
                      class="px-2 py-1 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-xs sm:text-sm"
                    >
                      二维码
                    </button>
                    <button
                      @click="editItem(item)"
                      class="px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs sm:text-sm"
                    >
                      编辑
                    </button>
                    <button
                      @click="deleteItem(item.id)"
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
          v-for="item in filteredAndSortedItems"
          :key="item.id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <router-link :to="`/items/${item.id}`" class="block">
            <div class="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
              <img
                v-if="item.image_data || item.image_data || item.image_url"
                :src="getImageUrl(item.image_url, item.image_data)"
                :alt="item.name"
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div class="p-3">
              <h3 class="font-medium text-gray-900 text-sm truncate mb-1">
                {{ item.name }}
              </h3>
              <p class="text-xs text-gray-500 truncate">
                {{ item.category_name || "-" }}
              </p>
              <div class="mt-2 flex items-center justify-between text-xs">
                <span class="text-gray-600">x{{ item.quantity }}</span>
                <span
                  v-if="item.purchase_price"
                  class="text-blue-600 font-medium"
                  >¥{{ item.purchase_price }}</span
                >
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
            <button
              @click.stop="editItem(item)"
              class="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              编辑
            </button>
            <button
              @click.stop="deleteItem(item.id)"
              class="flex-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 添加/编辑物品弹窗 -->
      <div
        v-if="showModal"
        :key="modalKey"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4"
        @click="closeModal"
      >
        <div
          id="item-modal"
          class="relative mx-auto border w-full max-w-2xl shadow-xl rounded-lg bg-white"
          style="top: 10px"
          @click.stop
        >
          <div class="p-4 sm:p-6">
            <h3
              class="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900"
            >
              {{ editingItem ? "编辑物品" : "添加物品" }}
            </h3>
            <form @submit.prevent="saveItem" class="space-y-4 sm:space-y-5">
              <!-- 第一步：选择类目 -->
              <div
                class="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200"
              >
                <label class="block text-sm font-semibold text-blue-900 mb-2"
                  >📦 第一步：选择物品类目 *</label
                >
                <CategorySelector
                  @select="onCategorySelect"
                  :initial-category-id="form.item_category_id"
                />
              </div>

              <!-- 第二步：基本信息 -->
              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label class="block text-sm font-semibold text-gray-900 mb-3"
                  >📝 第二步：填写物品信息</label
                >
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >名称 *</label
                    >
                    <input
                      v-model="form.name"
                      required
                      placeholder="物品名称（可自动从类目填充）"
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >描述</label
                    >
                    <textarea
                      v-model="form.description"
                      rows="2"
                      placeholder="物品的详细描述"
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- 第三步：存储位置 -->
              <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                <label class="block text-sm font-semibold text-green-900 mb-3"
                  >📍 第三步：选择存储位置</label
                >
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >地点</label
                    >
                    <select
                      v-model="form.location_id"
                      :disabled="!!form.drawer_id"
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option :value="null">{{ form.drawer_id ? '-- 跟随抽屉地点 --' : '-- 选择地点 --' }}</option>
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
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >抽屉</label
                    >
                    <select
                      v-model="form.drawer_id"
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option :value="null">-- 选择抽屉 --</option>
                      <option
                        v-for="drawer in drawers"
                        :key="drawer.id"
                        :value="drawer.id"
                      >
                        {{ drawer.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- 第四步：其他信息 -->
              <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <label class="block text-sm font-semibold text-yellow-900 mb-3"
                  >ℹ️ 第四步：补充详细信息</label
                >
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >数量</label
                      >
                      <input
                        v-model.number="form.quantity"
                        type="number"
                        min="1"
                        placeholder="1"
                        class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >价格（¥）</label
                      >
                      <input
                        v-model.number="form.purchase_price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >购买日期</label
                      >
                      <input
                        v-model="form.purchase_date"
                        type="date"
                        class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >到期日期</label
                      >
                      <input
                        v-model="form.expiry_date"
                        type="date"
                        class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <!-- 图片上传 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2"
                      >物品图片</label
                    >
                    <ImageUpload v-model="form.image_url" />
                  </div>
                </div>
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

      <!-- 确认删除对话框 -->
      <ConfirmDialog
        ref="confirmDialog"
        title="删除物品"
        message="确定要删除这个物品吗？删除后无法恢复。"
        type="danger"
        @confirm="confirmDelete"
      />

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
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, watch, nextTick } from "vue";
import Layout from "../components/Layout.vue";
import CategorySelector from "../components/CategorySelector.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import ImageUpload from "../components/ImageUpload.vue";
import { itemApi, locationApi, drawerApi, categoryApi } from "../api/modules";
import QRCodeDisplay from "../components/QRCodeDisplay.vue";

const items = ref<any[]>([]);
const locations = ref<any[]>([]);
const drawers = ref<any[]>([]);
const categories = ref<any[]>([]);
const showModal = ref(false);
const editingItem = ref<any>(null);
const modalKey = ref(0); // 用于强制重渲染弹窗

// 筛选和排序
const filterCategoryId = ref<number | null>(null);
const filterLocationId = ref<number | null>(null);
const filterDrawerId = ref<number | null>(null);
const sortKey = ref<string>("name");
const sortOrder = ref<number>(1); // 1 asc, -1 desc
const viewMode = ref<"list" | "grid">("list");

const form = reactive({
  name: "",
  description: "",
  item_category_id: null as number | null,
  location_id: null,
  drawer_id: null,
  quantity: 1,
  purchase_price: null,
  purchase_date: "",
  expiry_date: "",
  image_url: undefined as string | undefined,
});

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
    const [itemsRes, locationsRes, drawersRes, categoriesRes] =
      await Promise.all([
        itemApi.getAll(),
        locationApi.getAll(),
        drawerApi.getAll(),
        categoryApi.getAllItems(),
      ]);

    items.value = itemsRes.data || itemsRes;
    locations.value = locationsRes.data || locationsRes;
    drawers.value = drawersRes.data || drawersRes;
    categories.value = categoriesRes.data || categoriesRes;
  } catch (error) {
    console.error("加载数据失败:", error);
  }
};

// 监听抽屉选择变化，自动设置地点
watch(() => form.drawer_id, (newDrawerId: number | null) => {
  if (newDrawerId) {
    const selectedDrawer = drawers.value.find((d: any) => d.id === newDrawerId);
    if (selectedDrawer && selectedDrawer.location_id) {
      form.location_id = selectedDrawer.location_id;
    }
  }
});

// 筛选和排序逻辑
const filteredAndSortedItems = computed(() => {
  let list = [...items.value];

  // 筛选
  if (filterCategoryId.value) {
    list = list.filter(
      (item) => item.item_category_id === filterCategoryId.value,
    );
  }
  if (filterLocationId.value) {
    list = list.filter((item) => item.location_id === filterLocationId.value);
  }
  if (filterDrawerId.value) {
    list = list.filter((item) => item.drawer_id === filterDrawerId.value);
  }

  // 排序
  list.sort((a, b) => {
    const ka = (a[sortKey.value] || "").toString().toLowerCase();
    const kb = (b[sortKey.value] || "").toString().toLowerCase();
    if (ka < kb) return -1 * sortOrder.value;
    if (ka > kb) return 1 * sortOrder.value;
    return 0;
  });

  return list;
});

const setSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = -sortOrder.value;
  } else {
    sortKey.value = key;
    sortOrder.value = 1;
  }
};

const resetForm = () => {
  form.name = "";
  form.description = "";
  form.item_category_id = null;
  form.location_id = null;
  form.drawer_id = null;
  form.quantity = 1;
  form.purchase_price = null;
  form.purchase_date = "";
  form.expiry_date = "";
  form.image_url = undefined;
};

const openCreateModal = async () => {
  resetForm();
  editingItem.value = null;
  modalKey.value++; // 强制重渲染弹窗
  showModal.value = true;
  // 强制触发响应式更新
  await nextTick();
  // 确保弹窗DOM元素获得焦点
  setTimeout(() => {
    const firstInput = document.querySelector('#item-modal input');
    if (firstInput) {
      (firstInput as HTMLInputElement).focus();
    }
  }, 50);
};

const closeModal = () => {
  showModal.value = false;
  editingItem.value = null;
  resetForm();
};

const onCategorySelect = ({
  itemCategoryId,
  name,
}: {
  itemCategoryId: number | null;
  name: string;
}) => {
  form.item_category_id = itemCategoryId;
  // 如果名称为空，自动填入选择的类目名称
  if (!form.name && itemCategoryId) {
    form.name = name;
  }
};

const editItem = (item: any) => {
  editingItem.value = item;
  Object.assign(form, {
    name: item.name,
    description: item.description,
    item_category_id: item.item_category_id,
    location_id: item.location_id,
    drawer_id: item.drawer_id,
    quantity: item.quantity,
    purchase_price: item.purchase_price,
    purchase_date: item.purchase_date,
    expiry_date: item.expiry_date,
    image_url: item.image_data || item.image_url, // 优先使用 image_data
  });
  showModal.value = true;
};

const saveItem = async () => {
  try {
    // 准备提交的数据，将 image_url 同时存到 image_data
    const submitData = {
      ...form,
      image_data: form.image_url // Base64 数据存到 image_data
    };
    
    if (editingItem.value) {
      await itemApi.update(editingItem.value.id, submitData);
    } else {
      await itemApi.create(submitData);
    }
    await loadData();
    closeModal();
  } catch (error) {
    console.error("保存失败:", error);
    alert("保存失败");
  }
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
