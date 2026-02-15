<template>
  <Teleport to="body">
    <div class="print-qr-modal" v-if="visible" @click.stop>
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]" @click="close">
        <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800" @click.stop>
          <h3 class="text-lg font-medium mb-4 text-gray-900 dark:text-white">打印二维码设置</h3>
        
        <!-- 预览区域 -->
        <div class="mb-6 text-center">
          <img 
            v-if="qrCodeImage" 
            :src="qrCodeImage" 
            :alt="title"
            class="mx-auto rounded-lg shadow-md"
            :style="{ maxWidth: previewSize + 'px' }"
          />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ title }}</p>
        </div>

        <!-- 纸张大小选择 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">纸张大小</label>
          <div class="space-y-2">
            <label v-for="size in paperSizes" :key="size.name" class="flex items-center">
              <input 
                type="radio" 
                :value="size.name" 
                v-model="selectedPaperSize"
                class="mr-2"
              />
              <span class="text-sm text-gray-900 dark:text-gray-300">{{ size.label }} ({{ size.width }}mm × {{ size.height }}mm)</span>
            </label>
            <label class="flex items-center">
              <input 
                type="radio" 
                value="custom" 
                v-model="selectedPaperSize"
                class="mr-2"
              />
              <span class="text-sm text-gray-900 dark:text-gray-300">自定义大小</span>
            </label>
          </div>
          
          <!-- 自定义尺寸输入 -->
          <div v-if="selectedPaperSize === 'custom'" class="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">宽度 (mm)</label>
              <input 
                type="number" 
                v-model.number="customWidth"
                min="10"
                max="500"
                class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="宽度"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">高度 (mm)</label>
              <input 
                type="number" 
                v-model.number="customHeight"
                min="10"
                max="500"
                class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="高度"
              />
            </div>
          </div>
        </div>

        <!-- 打印选项 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">打印选项</label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input 
                type="checkbox" 
                v-model="showTitle"
                class="mr-2"
              />
              <span class="text-sm text-gray-900 dark:text-gray-300">显示标题</span>
            </label>
            <label class="flex items-center">
              <input 
                type="checkbox" 
                v-model="showBorder"
                class="mr-2"
              />
              <span class="text-sm text-gray-900 dark:text-gray-300">显示边框</span>
            </label>
          </div>
        </div>

        <!-- 二维码大小调节 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">二维码大小</label>
          <input 
            type="range" 
            min="100" 
            max="400" 
            v-model="qrCodeSize"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>小</span>
            <span>{{ qrCodeSize }}px</span>
            <span>大</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end space-x-3">
          <button
            @click.stop="close"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            取消
          </button>
          <button
            @click.stop="saveAsImage"
            class="px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-700 dark:hover:bg-purple-600"
          >
            保存图片
          </button>
          <button
            @click.stop="previewPrint"
            class="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            预览
          </button>
          <button
            @click.stop="confirmPrint"
            class="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-700 dark:hover:bg-green-600"
          >
            打印
          </button>
        </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

interface Props {
  visible: boolean;
  qrCodeImage: string;
  title: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

// 纸张大小配置
const paperSizes = [
  { name: 'A4', label: 'A4 标准', width: 210, height: 297 },
  { name: 'label-small', label: '小标签', width: 30, height: 20 },
  { name: 'label-medium', label: '中等标签', width: 50, height: 30 },
  { name: 'label-large', label: '大标签', width: 70, height: 50 },
  { name: 'label-wide', label: '宽标签', width: 100, height: 30 }
];

const selectedPaperSize = ref('A4');
const showTitle = ref(true);
const showBorder = ref(false);
const qrCodeSize = ref(200);
const customWidth = ref(60);
const customHeight = ref(40);

// 检测是否为桌面端（非手机和平板）
const isDesktop = ref(false);

const detectDevice = () => {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isLargeScreen = window.innerWidth >= 1024;
  isDesktop.value = !isMobile && isLargeScreen;
};

onMounted(() => {
  detectDevice();
  window.addEventListener('resize', detectDevice);
});

// 获取当前选择的尺寸
const getCurrentSize = () => {
  if (selectedPaperSize.value === 'custom') {
    return {
      width: customWidth.value,
      height: customHeight.value,
      name: 'custom',
      label: '自定义'
    };
  }
  return paperSizes.find(size => size.name === selectedPaperSize.value) || paperSizes[0];
};

// 计算预览尺寸
const previewSize = computed(() => {
  const currentSize = getCurrentSize();
  if (!currentSize) return 150;
  const scale = Math.min(150 / currentSize.width, 150 / currentSize.height);
  return Math.min(currentSize.width * scale, currentSize.height * scale);
});

// 不再自动触发打印，让用户手动选择操作
// watch(() => props.visible, (newVisible) => {
//   if (newVisible && isDesktop.value) {
//     setTimeout(() => {
//       confirmPrint();
//     }, 300);
//   }
// });

// 获取打印样式
const getPrintStyles = () => {
  const currentSize = getCurrentSize();
  if (!currentSize) return { pageSize: 'A4', margin: '10mm', qrSize: '200px' };
  
  const isLabel = selectedPaperSize.value.startsWith('label-') || (selectedPaperSize.value === 'custom' && currentSize.width < 150);
  
  return {
    pageSize: isLabel ? `${currentSize.width}mm ${currentSize.height}mm` : selectedPaperSize.value,
    margin: isLabel ? '2mm' : '10mm',
    qrSize: isLabel ? 
      Math.min(currentSize.width - 4, currentSize.height - (showTitle.value ? 10 : 4)) + 'mm' : 
      qrCodeSize.value + 'px'
  };
};

// 关闭对话框
const close = () => {
  emit('close');
};

// 预览打印
const previewPrint = () => {
  generatePrintWindow(true);
};

// 确认打印
const confirmPrint = () => {
  generatePrintWindow(false);
  if (!isDesktop.value) {
    close();
  }
};

// 保存为图片
const saveAsImage = async () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const styles = getPrintStyles();
  const currentSize = getCurrentSize();
  if (!currentSize) return;
  
  const isLabel = selectedPaperSize.value.startsWith('label-') || (selectedPaperSize.value === 'custom' && currentSize.width < 150);
  
  // 提高分辨率：使用 3 倍放大 (相当于 288 DPI)
  const scale = 3;
  const mmToPx = (mm: number) => Math.round(mm * 3.7795 * scale);
  const canvasWidth = mmToPx(currentSize.width);
  const canvasHeight = mmToPx(currentSize.height);
  
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // 应用缩放以保持绘制坐标系统一致
  ctx.scale(scale, scale);
  
  // 白色背景
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvasWidth / scale, canvasHeight / scale);
  
  // 边框
  if (showBorder.value) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasWidth / scale, canvasHeight / scale);
  }
  
  // 加载二维码图片
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const margin = mmToPx(isLabel ? 2 : 10) / scale;
    const titleHeight = showTitle.value ? (isLabel ? 20 : 30) : 0;
    const qrSize = Math.min(
      canvasWidth / scale - margin * 2,
      canvasHeight / scale - margin * 2 - titleHeight
    );
    
    const qrX = (canvasWidth / scale - qrSize) / 2;
    const qrY = (canvasHeight / scale - qrSize - titleHeight) / 2 + titleHeight;
    
    // 绘制标题
    if (showTitle.value) {
      ctx.fillStyle = '#333';
      ctx.font = `bold ${isLabel ? 12 : 18}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(props.title, canvasWidth / scale / 2, qrY - titleHeight / 2);
    }
    
    // 绘制二维码 - 启用图像平滑以提高质量
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
    
    // 下载图片
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrcode-${props.title}-${currentSize.label}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  };
  
  img.src = props.qrCodeImage;
};

// 生成打印窗口
const generatePrintWindow = (isPreview: boolean = false) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('请允许弹出窗口以进行打印');
    return;
  }

  const styles = getPrintStyles();
  const currentSize = getCurrentSize();
  if (!currentSize) return;
  
  const isLabel = selectedPaperSize.value.startsWith('label-') || (selectedPaperSize.value === 'custom' && currentSize.width < 150);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>打印二维码 - ${props.title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: ${styles.pageSize};
          margin: ${styles.margin};
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color: black !important;
          }
        }
        
        body {
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          ${showBorder.value ? 'border: 1px solid #333;' : ''}
          background: white;
        }
        
        .qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: ${isLabel ? '2mm' : '5mm'};
        }
        
        .qr-code {
          width: ${styles.qrSize};
          height: ${styles.qrSize};
          object-fit: contain;
        }
        
        .title {
          font-size: ${isLabel ? '8px' : '12px'};
          font-weight: bold;
          color: #333;
          word-wrap: break-word;
          max-width: ${currentSize.width - 4}mm;
          line-height: 1.2;
        }
      </style>
    </head>
    <body>
      <div class="qr-container">
        ${showTitle.value ? `<div class="title">${props.title}</div>` : ''}
        <img src="${props.qrCodeImage}" alt="QR Code" class="qr-code" />
      </div>
      
      <script>
        ${isPreview ? '' : `
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }, 500);
          };
        `}
      <` + `/script>
    <` + `/body>
    <` + `/html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  
  if (isPreview) {
    printWindow.focus();
  }
};
</script>

<style scoped>
.print-qr-modal {
  font-family: system-ui, -apple-system, sans-serif;
}
</style>