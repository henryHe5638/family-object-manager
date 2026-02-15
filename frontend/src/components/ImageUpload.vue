<template>
  <div class="image-upload">
    <!-- 图片预览 -->
    <div v-if="modelValue" class="image-preview mb-3">
      <img :src="imageUrl" alt="预览图" class="preview-image rounded-lg shadow-md" />
      <button
        type="button"
        @click="removeImage"
        class="remove-btn absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 上传按钮 -->
    <div v-else class="upload-area border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      />
      <button
        type="button"
        @click="triggerFileInput"
        class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        :disabled="uploading"
      >
        <svg v-if="!uploading" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <svg v-else class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ uploading ? '上传中...' : '选择图片' }}
      </button>
      <p class="text-xs text-gray-500 mt-2">支持 JPG、PNG、GIF、WebP，最大 5MB</p>
    </div>

    <!-- 错误提示 -->
    <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { uploadApi } from '../api/modules';

interface Props {
  modelValue?: string; // 图片 URL
}

interface Emits {
  (e: 'update:modelValue', value: string | null): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement>();
const uploading = ref(false);
const error = ref('');

// 完整图片 URL
const imageUrl = computed(() => {
  if (!props.modelValue) return '';
  // 如果是 Base64 data URL，直接返回
  if (props.modelValue.startsWith('data:')) return props.modelValue;
  // 如果已经是完整 URL，直接返回
  if (props.modelValue.startsWith('http')) return props.modelValue;
  // 否则拼接 API 地址（兼容旧数据）
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const baseUrl = apiUrl.replace('/api', '');
  return `${baseUrl}${props.modelValue}`;
});

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    error.value = '请选择图片文件（JPG、PNG、GIF、WebP）';
    return;
  }

  // 验证文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    error.value = '图片大小不能超过 5MB';
    return;
  }

  error.value = '';
  uploading.value = true;

  try {
    const response: any = await uploadApi.uploadImage(file);
    emit('update:modelValue', response.imageUrl);
  } catch (err: any) {
    error.value = err.response?.data?.error || '上传失败，请重试';
    console.error('上传图片错误:', err);
  } finally {
    uploading.value = false;
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
