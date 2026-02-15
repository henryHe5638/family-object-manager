<template>
  <Layout>
    <div class="px-4 sm:px-0">
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">扫码识别</h1>
        <button
          @click="startScanning"
          v-if="!isScanning"
          class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          开始扫码
        </button>
        <button
          @click="stopScanning"
          v-else
          class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          停止扫码
        </button>
      </div>

      <!-- 摄像头视频流 -->
      <div class="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div class="p-6">
          <div class="relative">
            <video
              ref="videoElement"
              class="w-full max-w-md mx-auto rounded-lg shadow-lg"
              :class="{ 'hidden': !isScanning }"
              autoplay
              playsinline
            ></video>
            
            <!-- 扫码区域框架 -->
            <div
              v-if="isScanning"
              class="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div class="w-64 h-64 border-4 border-blue-500 border-dashed rounded-lg opacity-70">
                <div class="w-full h-full relative">
                  <!-- 四个角的装饰 -->
                  <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-600"></div>
                  <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-600"></div>
                  <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-600"></div>
                  <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-600"></div>
                </div>
              </div>
            </div>

            <!-- 扫码状态显示 -->
            <div v-if="!isScanning" class="text-center py-12">
              <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
              </svg>
              <h3 class="mt-4 text-lg font-medium text-gray-900">摄像头扫码识别</h3>
              <p class="mt-2 text-sm text-gray-500">
                点击"开始扫码"按钮启用摄像头，扫描二维码获取物品或抽屉信息
              </p>
            </div>
          </div>

          <!-- 扫码结果显示 -->
          <div v-if="scanResult" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 class="text-lg font-medium text-green-800 mb-2">扫码结果</h3>
            <p class="text-sm text-green-700 mb-3">检测到内容: {{ scanResult }}</p>
            <div class="flex space-x-3">
              <button
                @click="handleScanResult"
                class="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                查看详情
              </button>
              <button
                @click="clearResult"
                class="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                清除结果
              </button>
            </div>
          </div>

          <!-- 错误消息显示 -->
          <div v-if="errorMessage" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 class="text-lg font-medium text-red-800 mb-2">扫码错误</h3>
            <p class="text-sm text-red-700">{{ errorMessage }}</p>
          </div>

          <!-- 使用说明 -->
          <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="text-lg font-medium text-blue-800 mb-2">使用说明</h3>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• 确保设备摄像头权限已开启</li>
              <li>• 将二维码放在扫码框内，保持稳定</li>
              <li>• 系统会自动识别二维码内容并跳转到对应页面</li>
              <li>• 支持物品和抽屉的二维码识别</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Layout from '../components/Layout.vue';

const router = useRouter();
const videoElement = ref<HTMLVideoElement>();
const isScanning = ref(false);
const scanResult = ref('');
const errorMessage = ref('');
let mediaStream: MediaStream | null = null;
let animationFrame: number | null = null;

// Canvas用于图像处理
let canvas: HTMLCanvasElement | null = null;
let canvasContext: CanvasRenderingContext2D | null = null;

// 初始化Canvas
const initCanvas = () => {
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvasContext = canvas.getContext('2d');
  }
};

// 开始扫码
const startScanning = async () => {
  try {
    errorMessage.value = '';
    
    // 请求摄像头权限
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // 后置摄像头优先
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    if (videoElement.value) {
      videoElement.value.srcObject = mediaStream;
      videoElement.value.play();
      isScanning.value = true;
      initCanvas();
      scanFrame();
    }
  } catch (error) {
    console.error('启动摄像头失败:', error);
    errorMessage.value = '无法启动摄像头，请检查权限设置';
  }
};

// 停止扫码
const stopScanning = () => {
  isScanning.value = false;
  
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }

  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
};

// 扫描帧处理
const scanFrame = () => {
  if (!isScanning.value || !videoElement.value || !canvas || !canvasContext) return;

  const video = videoElement.value;
  
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvasContext.drawImage(video, 0, 0);
    
    const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
    
    // 使用jsQR库解析二维码（需要动态导入）
    detectQRCode(imageData);
  }

  animationFrame = requestAnimationFrame(scanFrame);
};

// 检测二维码
const detectQRCode = async (imageData: ImageData) => {
  try {
    // 动态导入jsQR库
    const jsQR = await import('jsqr');
    // @ts-ignore - jsqr库没有TypeScript类型定义
    const code = jsQR.default(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      scanResult.value = code.data;
      stopScanning();
      
      // 自动处理扫码结果
      setTimeout(() => {
        handleScanResult();
      }, 1000);
    }
  } catch (error) {
    console.error('二维码解析失败:', error);
  }
};

// 处理扫码结果
const handleScanResult = () => {
  if (!scanResult.value) return;

  try {
    // 尝试解析URL
    const url = new URL(scanResult.value);
    const pathname = url.pathname;
    
    // 检查是否是本系统的URL
    if (pathname.startsWith('/items/')) {
      const itemId = pathname.split('/')[2];
      router.push(`/items/${itemId}`);
    } else if (pathname.startsWith('/drawers/')) {
      const drawerId = pathname.split('/')[2];
      router.push(`/drawers/${drawerId}`);
    } else {
      // 如果不是URL格式，尝试直接作为ID处理
      handleDirectId(scanResult.value);
    }
  } catch (error) {
    // 如果不是有效URL，尝试解析为直接ID
    handleDirectId(scanResult.value);
  }
};

// 处理直接ID（防止域名变化导致的问题）
const handleDirectId = (content: string) => {
  // 尝试提取ID模式
  const itemMatch = content.match(/\/items\/(\d+)/);
  const drawerMatch = content.match(/\/drawers\/(\d+)/);
  
  if (itemMatch) {
    router.push(`/items/${itemMatch[1]}`);
  } else if (drawerMatch) {
    router.push(`/drawers/${drawerMatch[1]}`);
  } else if (/^\d+$/.test(content)) {
    // 纯数字ID，默认作为物品ID
    router.push(`/items/${content}`);
  } else {
    errorMessage.value = '无法识别的二维码内容格式';
  }
};

// 清除扫码结果
const clearResult = () => {
  scanResult.value = '';
  errorMessage.value = '';
};

// 组件卸载时清理资源
onUnmounted(() => {
  stopScanning();
});

// 检查浏览器兼容性
onMounted(() => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    errorMessage.value = '您的浏览器不支持摄像头功能';
  }
});
</script>

<style scoped>
video {
  transform: scaleX(-1); /* 镜像显示 */
}

@keyframes scan-line {
  0% { top: 0; }
  100% { top: 100%; }
}

.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #3b82f6, transparent);
  animation: scan-line 2s linear infinite;
}
</style>