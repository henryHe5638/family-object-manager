<template>
  <div v-if="show" class="modal-overlay" @click="emit('close')">
    <div class="modal-panel" :class="maxWidth" @click.stop>
      <div class="flex items-start justify-between p-4 sm:p-6 pb-3 shrink-0">
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        <button
          type="button"
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors -mt-1 -mr-1 p-1"
          aria-label="关闭"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="modal-body px-4 sm:px-6 pb-4 sm:pb-6">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean;
  title?: string;
  maxWidth?: string;
}

withDefaults(defineProps<Props>(), {
  title: '',
  maxWidth: 'max-w-2xl',
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>
