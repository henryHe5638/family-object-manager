<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center min-w-0">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-sm sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">家庭物资管理</h1>
            </div>
            <div class="hidden lg:ml-6 lg:flex lg:space-x-6 xl:space-x-8 overflow-x-auto">
              <router-link
                to="/"
                class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 whitespace-nowrap"
                active-class="border-blue-500 text-gray-900 dark:text-white"
              >
                首页
              </router-link>
              <router-link
                to="/items"
                class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 whitespace-nowrap"
                active-class="border-blue-500 text-gray-900 dark:text-white"
              >
                物品
              </router-link>
              <router-link
                to="/drawers"
                class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 whitespace-nowrap"
                active-class="border-blue-500 text-gray-900 dark:text-white"
              >
                抽屉
              </router-link>
              <router-link
                to="/locations"
                class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 whitespace-nowrap"
                active-class="border-blue-500 text-gray-900 dark:text-white"
              >
                地点
              </router-link>
              <router-link
                to="/categories"
                class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 whitespace-nowrap"
                active-class="border-blue-500 text-gray-900 dark:text-white"
              >
                类目
              </router-link>
              <router-link
                to="/scanner"
                class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 whitespace-nowrap"
                active-class="border-blue-500 text-gray-900 dark:text-white"
              >
                扫码
              </router-link>
              <router-link
                v-if="authStore.isAdmin"
                to="/users"
                class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200"
                active-class="border-blue-500 text-gray-900 dark:text-white"
              >
                用户
              </router-link>
              <router-link
                v-if="authStore.isAdmin"
                to="/settings"
                class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200"
                active-class="border-blue-500 text-gray-900 dark:text-white"
              >
                设置
              </router-link>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <!-- 到期提醒铃铛 -->
            <ExpiryBell class="mr-2" />
            
            <!-- 主题切换按钮 -->
            <button
              @click="themeStore.toggleTheme()"
              class="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              :title="themeStore.isDark ? '切换到亮色模式' : '切换到暗色模式'"
            >
              <!-- 太阳图标 (亮色模式) -->
              <svg v-if="!themeStore.isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <!-- 月亮图标 (暗色模式) -->
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            
            <div class="hidden sm:flex sm:items-center sm:space-x-4">
              <span class="text-sm text-gray-700 dark:text-gray-300">
                {{ authStore.user?.username }}
                <span v-if="authStore.isAdmin" class="ml-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">管理员</span>
              </span>
              <button
                @click="handleLogout"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                退出登录
              </button>
            </div>
            
            <!-- 移动端菜单按钮 -->
            <div class="lg:hidden">
              <button 
                @click="showMobileMenu = !showMobileMenu"
                class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 移动端和中等屏幕菜单 -->
      <div v-if="showMobileMenu" class="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div class="pt-2 pb-3 space-y-1 max-h-96 overflow-y-auto">
          <router-link
            to="/"
            @click="showMobileMenu = false"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="$route.path === '/' ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'"
          >
            首页
          </router-link>
          <router-link
            to="/items"
            @click="showMobileMenu = false"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="$route.path === '/items' ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'"
          >
            物品
          </router-link>
          <router-link
            to="/drawers"
            @click="showMobileMenu = false"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="$route.path === '/drawers' ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'"
          >
            抽屉
          </router-link>
          <router-link
            to="/locations"
            @click="showMobileMenu = false"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="$route.path === '/locations' ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'"
          >
            地点
          </router-link>
          <router-link
            to="/categories"
            @click="showMobileMenu = false"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="$route.path === '/categories' ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'"
          >
            类目
          </router-link>
          <router-link
            to="/scanner"
            @click="showMobileMenu = false"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="$route.path === '/scanner' ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'"
          >
            扫码
          </router-link>
          <router-link
            v-if="authStore.isAdmin"
            to="/users"
            @click="showMobileMenu = false"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="$route.path === '/users' ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'"
          >
            用户
          </router-link>
          <router-link
            v-if="authStore.isAdmin"
            to="/settings"
            @click="showMobileMenu = false"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="$route.path === '/settings' ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'"
          >
            设置
          </router-link>
        </div>
        <div class="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center px-4">
            <span class="text-base font-medium text-gray-800 dark:text-gray-200">{{ authStore.user?.username }}</span>
            <span v-if="authStore.isAdmin" class="ml-3 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">管理员</span>
          </div>
          <div class="mt-3 px-4">
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import { useRouter } from 'vue-router';
import ExpiryBell from './ExpiryBell.vue';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();
const showMobileMenu = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
  showMobileMenu.value = false;
};
</script>
