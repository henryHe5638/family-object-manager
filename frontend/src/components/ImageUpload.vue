<template>
  <div class="image-upload">
    <!-- 图片预览 -->
    <div v-if="modelValue" class="image-preview mb-3">
      <img :src="imageUrl" alt="预览图" class="preview-image rounded-lg shadow-md" />
      <button
        type="button"
        @click="removeImage"
        class="remove-btn absolute top-2 right-2 btn btn-danger btn-sm rounded-full"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 上传按钮 -->
    <div v-else class="upload-area border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
      <input
        ref="fileInput"
        type="file"
        :accept="fileAccept"
        class="hidden"
        @change="handleFileChange"
      />
      <button
        type="button"
        @click="triggerFileInput"
        class="btn btn-secondary"
        :disabled="processing"
      >
        <svg v-if="!processing" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <svg v-else class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ processing ? '处理中...' : '选择图片' }}
      </button>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">支持 JPG、PNG、GIF、WebP、HEIC/HEIF，最大 20MB<br>图片将自动压缩到 1MB 以内，随表单一起提交</p>
    </div>

    <!-- 错误提示 -->
    <p v-if="error" class="text-red-500 dark:text-red-400 text-sm mt-2">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { uploadApi } from '../api/modules';

interface Props {
  modelValue?: string; // 图片 data URL 或历史 URL
}

interface Emits {
  (e: 'update:modelValue', value: string | null): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement>();
const processing = ref(false);
const error = ref('');

// 部分手机 Chrome 在 accept 混写 MIME 和扩展名时不弹出文件选择器，
// 触屏设备只用 image/*，桌面端保留 HEIC/HEIF 扩展名以便选中这类文件
const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
const fileAccept = isTouchDevice ? 'image/*' : 'image/*,.heic,.heif';

// 压缩目标：1MB
const MAX_IMAGE_BYTES = 1024 * 1024;
const HEIF_TYPES = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];

// 完整图片 URL
const imageUrl = computed(() => {
  if (!props.modelValue) return '';
  // 如果是 Base64 data URL，直接返回
  if (props.modelValue.startsWith('data:')) return props.modelValue;
  // 如果已经是完整 URL，直接返回
  if (props.modelValue.startsWith('http')) return props.modelValue;
  // 否则拼接 API 地址（兼容旧数据）
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const shouldUseRuntime =
    typeof window !== 'undefined' &&
    !import.meta.env.VITE_API_URL &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';
  const runtimeBase = typeof window !== 'undefined' ? window.location.origin : '';
  const baseUrl = shouldUseRuntime ? runtimeBase : apiUrl.replace('/api', '');
  return `${baseUrl}${props.modelValue}`;
});

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });

const loadImage = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片解码失败'));
    img.src = dataUrl;
  });

// 通过 canvas 压缩图片到 1MB 以内（输出 JPEG）
const compressToDataUrl = async (dataUrl: string): Promise<string> => {
  const img = await loadImage(dataUrl);
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  const qualities = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35];
  let result = dataUrl;

  for (let attempt = 0; attempt < 12; attempt++) {
    canvas.width = width;
    canvas.height = height;
    // 透明区域填充白色（JPEG 不支持透明）
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const quality = qualities[Math.min(attempt, qualities.length - 1)];
    result = canvas.toDataURL('image/jpeg', quality);

    // base64 长度 * 3/4 ≈ 实际字节数
    if (result.length * 0.75 <= MAX_IMAGE_BYTES) break;

    // 仍超限时缩小尺寸再试
    width = Math.round(width / 2);
    height = Math.round(height / 2);
    if (width < 320 || height < 320) break;
  }

  return result;
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // 验证文件类型
  const heifByExt = !file.type && /\.(heic|heif)$/i.test(file.name);
  const isHeif = HEIF_TYPES.includes(file.type) || heifByExt;
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', ...HEIF_TYPES];
  if (!allowedTypes.includes(file.type) && !heifByExt) {
    error.value = '请选择图片文件（JPG、PNG、GIF、WebP、HEIC/HEIF）';
    return;
  }

  // 验证文件大小（20MB）
  if (file.size > 20 * 1024 * 1024) {
    error.value = '图片大小不能超过 20MB';
    return;
  }

  error.value = '';
  processing.value = true;

  try {
    let finalDataUrl: string;

    if (isHeif) {
      // HEIC/HEIF 浏览器无法解码，先由服务端转成 JPEG，再压缩到 1MB 以内
      const response: any = await uploadApi.uploadImage(file);
      const converted: string = response.imageUrl || response.imageData;
      finalDataUrl = await compressToDataUrl(converted);
    } else {
      // 普通图片：本地读取并压缩，随表单一起提交（不再单独调用上传接口）
      const dataUrl = await fileToDataUrl(file);
      finalDataUrl = file.size <= MAX_IMAGE_BYTES ? dataUrl : await compressToDataUrl(dataUrl);
    }

    emit('update:modelValue', finalDataUrl);
  } catch (err: any) {
    error.value = err.response?.data?.error || '图片处理失败，请重试';
    console.error('处理图片错误:', err);
  } finally {
    processing.value = false;
    if (target) target.value = '';
  }
};

const removeImage = () => {
  emit('update:modelValue', null);
  error.value = '';
};

const triggerFileInput = () => {
  fileInput.value?.click();
};
</script>

<style scoped>
.image-preview {
  position: relative;
  display: inline-block;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
}

.remove-btn {
  transition: all 0.2s;
}

.remove-btn:hover {
  transform: scale(1.1);
}
</style>
