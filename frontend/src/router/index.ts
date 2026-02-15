import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/locations',
      name: 'Locations',
      component: () => import('../views/Locations.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/locations/:id',
      name: 'LocationDetail',
      component: () => import('../views/LocationDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/categories',
      name: 'Categories',
      component: () => import('../views/Categories.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/drawers',
      name: 'Drawers',
      component: () => import('../views/Drawers.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/drawers/:id',
      name: 'DrawerDetail',
      component: () => import('../views/DrawerDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/items',
      name: 'Items',
      component: () => import('../views/Items.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/items/:id',
      name: 'ItemDetail',
      component: () => import('../views/ItemDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('../views/Users.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Settings.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/qr/:qrCode',
      name: 'QRScanner',
      component: () => import('../views/QRScanner.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/scanner',
      name: 'CameraScanner',
      component: () => import('../views/CameraScanner.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    next('/');
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // 需要管理员权限但用户不是管理员
    next('/');
  } else {
    next();
  }
});

export default router;
