<template>
  <BaseModal :show="show" :title="item ? '编辑物品' : '添加物品'" @close="emit('close')">
    <form id="item-form-modal" @submit.prevent="saveItem" class="space-y-4 sm:space-y-5">
      <!-- 第一步：选择类目 -->
      <div class="bg-blue-50 dark:bg-blue-900/30 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <label class="block text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">📦 第一步：选择物品类目 *</label>
        <CategorySelector
          @select="onCategorySelect"
          :initial-category-id="form.item_category_id"
        />
      </div>

      <!-- 第二步：基本信息 -->
      <div class="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <label class="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">📝 第二步：填写物品信息</label>
        <div class="space-y-4">
          <div>
            <label class="form-label">名称 *</label>
            <input
              v-model="form.name"
              required
              placeholder="物品名称（可自动从类目填充）"
              class="input mt-1"
            />
          </div>
          <div>
            <label class="form-label">描述</label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="物品的详细描述"
              class="input mt-1"
            ></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">品牌</label>
              <input
                v-model="form.brand"
                placeholder="物品品牌（可选）"
                class="input mt-1"
              />
            </div>
            <div>
              <label class="form-label">大小</label>
              <input
                v-model="form.size"
                placeholder="重量/体积/尺码等"
                class="input mt-1"
              />
            </div>
          </div>
          <div class="flex items-center">
            <input id="item-form-is-private" v-model="form.is_private" type="checkbox" class="checkbox" />
            <label for="item-form-is-private" class="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              🔒 私人物品 <span class="text-gray-400 dark:text-gray-500">（勾选后仅自己可见，不勾选则所有用户可见）</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 第三步：存储位置 -->
      <div class="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <label class="block text-sm font-semibold text-green-900 dark:text-green-200 mb-3">📍 第三步：选择存储位置</label>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">地点</label>
            <select
              v-model="form.location_id"
              :disabled="!!form.drawer_id"
              class="input mt-1"
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
          <div v-if="!fixedDrawerId">
            <label class="form-label">抽屉</label>
            <select v-model="form.drawer_id" class="input mt-1">
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
      <div class="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <label class="block text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-3">ℹ️ 第四步：补充详细信息</label>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">数量</label>
              <input
                v-model.number="form.quantity"
                type="number"
                min="1"
                placeholder="1"
                class="input mt-1"
              />
            </div>
            <div>
              <label class="form-label">价格（¥）</label>
              <input
                v-model.number="form.purchase_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                class="input mt-1"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">购买日期</label>
              <input v-model="form.purchase_date" type="date" class="input mt-1" />
            </div>
            <div>
              <label class="form-label">生产日期</label>
              <input v-model="form.production_date" type="date" class="input mt-1" />
            </div>
            <div>
              <label class="form-label">到期日期</label>
              <input v-model="form.expiry_date" type="date" class="input mt-1" />
            </div>
          </div>

          <div v-if="item">
            <label class="form-label">物品状态</label>
            <select v-model="form.status" class="input mt-1">
              <option value="stored">在库</option>
              <option value="in_use">使用中</option>
              <option value="discarded">已丢弃</option>
            </select>
          </div>

          <!-- 图片上传 -->
          <div>
            <label class="form-label mb-2">物品图片</label>
            <ImageUpload v-model="form.image_url" />
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 pt-4">
        <button type="button" @click="emit('close')" class="btn btn-secondary">取消</button>
        <button type="submit" :disabled="saving" class="btn btn-primary">{{ saving ? '保存中...' : '保存' }}</button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, onMounted } from 'vue';
import BaseModal from './BaseModal.vue';
import CategorySelector from './CategorySelector.vue';
import ImageUpload from './ImageUpload.vue';
import { itemApi, locationApi, drawerApi } from '../api/modules';

const props = withDefaults(defineProps<{
  show: boolean;
  /** 编辑时传入物品对象，新增传 null */
  item?: any | null;
  /** 从抽屉详情进入时锁定抽屉 id */
  fixedDrawerId?: number | null;
  /** 从抽屉详情进入时锁定地点 id */
  fixedLocationId?: number | null;
}>(), {
  item: null,
  fixedDrawerId: null,
  fixedLocationId: null,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const locations = ref<any[]>([]);
const drawers = ref<any[]>([]);
const saving = ref(false);

const emptyForm = () => ({
  name: '',
  description: '',
  brand: '',
  size: '',
  item_category_id: null as number | null,
  location_id: null as number | null,
  drawer_id: null as number | null,
  quantity: 1,
  purchase_price: null as number | null,
  purchase_date: '',
  production_date: '',
  expiry_date: '',
  status: 'stored',
  is_private: false,
  image_url: undefined as string | undefined,
});

const form = reactive(emptyForm());

// 打开弹窗时根据传入物品重置表单
const populate = () => {
  const it = props.item;
  Object.assign(form, emptyForm());
  if (it) {
    Object.assign(form, {
      name: it.name,
      description: it.description || '',
      brand: it.brand || '',
      size: it.size || '',
      item_category_id: it.item_category_id,
      location_id: it.location_id,
      drawer_id: it.drawer_id,
      quantity: it.quantity,
      purchase_price: it.purchase_price,
      purchase_date: it.purchase_date || '',
      production_date: it.production_date || '',
      expiry_date: it.expiry_date || '',
      status: it.status || 'stored',
      is_private: !!it.is_private,
      image_url: it.image_data || it.image_url,
    });
  }
  // 抽屉详情场景：锁定抽屉与地点
  if (props.fixedDrawerId) {
    form.drawer_id = props.fixedDrawerId;
    form.location_id = props.fixedLocationId;
  }
};

watch(() => props.show, async (show) => {
  if (!show) return;
  populate();
  await nextTick();
  // 自动聚焦第一个输入框
  setTimeout(() => {
    const firstInput = document.querySelector('#item-form-modal input');
    if (firstInput) {
      (firstInput as HTMLInputElement).focus();
    }
  }, 50);
});

// 选择抽屉后自动跟随抽屉地点
watch(() => form.drawer_id, (drawerId) => {
  if (props.fixedDrawerId || !drawerId) return;
  const selected = drawers.value.find((d: any) => d.id === drawerId);
  if (selected && selected.location_id) {
    form.location_id = selected.location_id;
  }
});

onMounted(async () => {
  try {
    const [locationsRes, drawersRes] = await Promise.all([
      locationApi.getAll(),
      drawerApi.getAll(),
    ]);
    locations.value = locationsRes.data || locationsRes;
    drawers.value = drawersRes.data || drawersRes;
  } catch (error) {
    console.error('加载地点/抽屉失败:', error);
  }
});

const onCategorySelect = ({ itemCategoryId, name }: { itemCategoryId: number | null; name: string }) => {
  form.item_category_id = itemCategoryId;
  if (!form.name && itemCategoryId) {
    form.name = name;
  }
};

const saveItem = async () => {
  saving.value = true;
  try {
    const payload = {
      ...form,
      image_data: form.image_url,
    };
    if (props.item) {
      await itemApi.update(props.item.id, payload);
    } else {
      await itemApi.create(payload);
    }
    emit('saved');
    emit('close');
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败');
  } finally {
    saving.value = false;
  }
};
</script>
