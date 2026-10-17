<template>
  <BaseModal :show="show" title="批量打印设置" max-width="max-w-md" @close="close">
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
      已选 {{ selection.length }} 个{{ selection[0]?.kind === 'drawer' ? '抽屉' : '物品' }}，设置纸张后选择打印或导出 PDF。
    </p>

    <!-- 纸张大小 -->
    <div class="mb-4">
      <label class="form-label mb-2">纸张大小</label>
      <div class="space-y-2">
        <label v-for="size in paperSizes" :key="size.name" class="flex items-center">
          <input type="radio" :value="size.name" v-model="settings.selectedPaperSize" class="checkbox mr-2" />
          <span class="text-sm text-gray-900 dark:text-gray-300">{{ size.label }} ({{ size.width }}mm × {{ size.height }}mm)</span>
        </label>
        <label class="flex items-center">
          <input type="radio" value="custom" v-model="settings.selectedPaperSize" class="checkbox mr-2" />
          <span class="text-sm text-gray-900 dark:text-gray-300">自定义大小</span>
        </label>
      </div>
      <div v-if="settings.selectedPaperSize === 'custom'" class="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label class="form-label !text-xs">宽度 (mm)</label>
          <input type="number" v-model.number="settings.customWidth" min="10" max="500" class="input mt-1" />
        </div>
        <div>
          <label class="form-label !text-xs">高度 (mm)</label>
          <input type="number" v-model.number="settings.customHeight" min="10" max="500" class="input mt-1" />
        </div>
      </div>
    </div>

    <!-- 分辨率 -->
    <div class="mb-4">
      <label class="form-label mb-2">分辨率 (DPI)</label>
      <div class="flex gap-2">
        <label v-for="d in [150, 300, 600]" :key="d" class="flex-1">
          <input type="radio" :value="d" v-model.number="settings.dpi" class="peer sr-only" />
          <div class="text-center text-sm py-1.5 rounded-md border border-gray-300 dark:border-gray-600 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-600 dark:peer-checked:bg-blue-900/30 cursor-pointer">
            {{ d }}
          </div>
        </label>
      </div>
    </div>

    <!-- A4 宫格 -->
    <div v-if="settings.selectedPaperSize === 'A4'" class="mb-4">
      <label class="form-label mb-2">每页标签数（A4）</label>
      <select v-model.number="settings.labelsPerPage" class="input">
        <option :value="1">1 个（大标签）</option>
        <option :value="6">6 个（2×3）</option>
        <option :value="12">12 个（3×4）</option>
        <option :value="24">24 个（4×6）</option>
      </select>
    </div>

    <!-- 二维码大小（A4 时） -->
    <div v-if="settings.selectedPaperSize === 'A4'" class="mb-4">
      <label class="form-label mb-2">二维码大小</label>
      <input type="range" min="100" max="400" v-model.number="settings.qrCodeSize" class="w-full" />
      <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>小</span><span>{{ settings.qrCodeSize }}px</span><span>大</span>
      </div>
    </div>

    <!-- 选项 -->
    <div class="mb-6">
      <label class="form-label mb-2">选项</label>
      <label class="flex items-center mb-2">
        <input type="checkbox" v-model="settings.showTitle" class="checkbox mr-2" />
        <span class="text-sm text-gray-900 dark:text-gray-300">显示标题</span>
      </label>
      <label class="flex items-center">
        <input type="checkbox" v-model="settings.showBorder" class="checkbox mr-2" />
        <span class="text-sm text-gray-900 dark:text-gray-300">显示边框</span>
      </label>
    </div>

    <!-- 操作按钮 -->
    <div class="space-y-2">
      <button @click="doPrint(false)" :disabled="loading" class="btn btn-primary w-full">
        {{ loading ? `生成中 ${progress}/${selection.length}...` : '打印' }}
      </button>
      <div class="flex gap-2">
        <button @click="doPrint(true)" :disabled="loading" class="btn btn-secondary flex-1">预览</button>
        <button @click="doExportPDF" :disabled="loading" class="btn btn-secondary flex-1">导出 PDF</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import {
  paperSizes,
  loadPrintSettings,
  savePrintSettings,
  printLabels,
  exportLabelsPDF,
  type PrintSelection,
} from '../utils/batchPrint';

interface Props {
  show: boolean;
  selection: PrintSelection[];
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();

const settings = reactive(loadPrintSettings());
watch(settings, () => savePrintSettings({ ...settings }), { deep: true });

const loading = ref(false);
const progress = ref(0);

const onProgress = (done: number) => {
  progress.value = done;
};

const doPrint = async (isPreview: boolean) => {
  loading.value = true;
  progress.value = 0;
  try {
    await printLabels(props.selection, { ...settings }, isPreview, onProgress);
    if (!isPreview) close();
  } finally {
    loading.value = false;
  }
};

const doExportPDF = async () => {
  loading.value = true;
  progress.value = 0;
  try {
    await exportLabelsPDF(props.selection, { ...settings }, onProgress);
  } finally {
    loading.value = false;
  }
};

const close = () => {
  if (!loading.value) emit('close');
};
</script>
