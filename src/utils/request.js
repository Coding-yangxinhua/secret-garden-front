import axios from 'axios'

import { useUserStore } from '@/stores/user'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

// 请求拦截器
service.interceptors.request.use(
  // 添加Authorization头
  (config) => {
    const userStore = useUserStore()
    // 从本地存储获取token
    const token = userStore.getToken
    // 如果token存在，则添加到请求头
    if (token) {
      // 通常使用Bearer认证方式，格式为 Bearer token值
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 处理响应错误，例如401token过期
    const userStore = useUserStore()
    if (res.code === 401) {
      // 清除无效token
      userStore.clearUserInfo()
      // 跳转到登录页
      window.location.href = '/login'
    }
    return res
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default service
