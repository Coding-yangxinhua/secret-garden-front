import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ManageView from '@/views/ManageView.vue'
import LoginView from '@/views/LoginView.vue'
import LogView from '@/views/LogView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/log',
      name: 'log',
      component: LogView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/manage',
      name: 'manage',
      component: ManageView,
    },
    {
      path: '/manage/feedback',
      name: 'manageFeedback',
      component: () => import('@/views/ManageFeedbackView.vue'),
    },
    {
      path: '/feedback',
      name: 'feedback',
      component: () => import('@/views/FeedbackView.vue'),
    },
    {
      path: '/test-node-config',
      name: 'testNodeConfig',
      component: () => import('@/components/TestNodeConfig.vue'),
    },
  ],
})

export default router
