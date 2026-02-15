<template>
  <div class="qrcode-display">
    <div v-if="loading" class="text-center py-4">
      <svg class="animate-spin h-8 w-8 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-sm text-gray-500 mt-2">生成二维码中...</p>
    </div>

    <div v-else-if="error" class="text-center py-4">
      <p class="text-red-500 text-sm">{{ error }}</p>
      <button @click="loadQRCode" class="mt-2 text-blue-500 text-sm hover:underline">
        重试
      </button>
    </div>

    <div v-else-if="qrCodeData" class="qrcode-content">
      <!-- 二维码图片 -->
      <div class="qrcode-image-wrapper text-center">
        <img :src="qrCodeData.qrCodeImage" alt="二维码" class="qrcode-image mx-auto rounded-lg shadow-md" />
        <p class="text-xs text-gray-500 mt-2">扫码查看物品详情</p>
      </div>

      <!-- 操作按钮 -->
      <div class="actions mt-4 flex justify-center">
        <button
          @click.stop="showPrintModal"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
        >
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          打印/保存设置
        </button>
      </div>
    </div>

    <!-- 打印设置模态框 -->
    <PrintQRModal 
      :visible="printModalVisible"
      :qr-code-image="qrCodeData?.qrCodeImage || ''"
      :title="props.itemName || `物品 ${props.itemId}`"
      @close="closePrintModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { itemApi, drawerApi } from '../api/modules';
import PrintQRModal from './PrintQRModal.vue';

interface Props {
  itemId: number;
  itemName?: string;
  itemType?: 'item' | 'drawer';
}

const props = withDefaults(defineProps<Props>(), {
  itemType: 'item'
});

const loading = ref(false);
const error = ref('');
const qrCodeData = ref<any>(null);
const printModalVisible = ref(false);

const loadQRCode = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    let response: any;
    if (props.itemType === 'drawer') {
      response = await drawerApi.getQRCode(props.itemId);
    } else {
      response = await itemApi.getQRCode(props.itemId);
    }
    qrCodeData.value = response;
  } catch (err: any) {
    error.value = err.response?.data?.error || '加载二维码失败';
    console.error('加载二维码错误:', err);
  } finally {
    loading.value = false;
  }
};

const downloadQRCode = () => {
  if (!qrCodeData.value?.qrCodeImage) return;
  
  const link = document.createElement('a');
  link.href = qrCodeData.value.qrCodeImage;
  link.download = `qrcode-${props.itemName || props.itemId}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const showPrintModal = () => {
  printModalVisible.value = true;
};

const closePrintModal = () => {
  printModalVisible.value = false;
};

// 保留原有的打印方法作为备用
const printQRCode = () => {
  if (!qrCodeData.value?.qrCodeImage) return;
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('请允许弹出窗口以打印二维码');
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>打印二维码 - ${props.itemName || props.itemId}</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: Arial, sans-serif;
          }
          img {
            max-width: 300px;
            margin: 20px 0;
          }
          h2 {
            margin: 10px 0;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <h2>${props.itemName || '物品'}</h2>
        <img src="${qrCodeData.value.qrCodeImage}" alt="二维码" />
        <p>扫码查看物品详情</p>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

onMounted(() => {
  loadQRCode();
});
</script>

<style scoped>
.qrcode-image {
  width: 300px;
  height: 300px;
}
</style>
