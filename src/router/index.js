import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ManageView from '@/views/ManageView.vue'
import LcgklView from '@/views/LcgklView.vue'
import SxkView from '@/views/SxkView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/manage',
      name: 'manage',
      component: ManageView,
    },
    {
      path: '/lcgkl',
      name: 'lcgkl',
      component: LcgklView,
    },
    {
      path: '/sxk',
      name: 'sxk',
      component: SxkView,
    }
  ],
})

export default router
