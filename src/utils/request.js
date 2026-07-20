import axios from 'axios'
import { showNotify } from 'vant'

import router from '@/router'
import { useUserStore } from '@/stores/user'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

let isHandlingAuthExpired = false

const isAuthExpiredCode = (code) => code === 401 || code === '401'

const getCurrentPath = () => {
  const { pathname, search, hash } = window.location
  return `${pathname}${search}${hash}`
}

const handleAuthExpired = async (message = '登录已过期，请重新登录') => {
  if (isHandlingAuthExpired) return
  isHandlingAuthExpired = true

  const userStore = useUserStore()
  userStore.markSessionExpired()

  showNotify({ type: 'warning', message, duration: 2500 })

  if (router.currentRoute.value.name !== 'login') {
    await router.replace({
      name: 'login',
      query: { redirect: getCurrentPath() },
    })
  }

  setTimeout(() => {
    isHandlingAuthExpired = false
  }, 1000)
}

service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.getToken

    if (token) {
      config.headers.Authorization = token
    }

    return config
  },
  (error) => Promise.reject(error),
)

service.interceptors.response.use(
  (response) => {
    if (response.status === 204) {
      return { code: 204, data: null }
    }

    const res = response.data

    if (isAuthExpiredCode(res?.code)) {
      handleAuthExpired(res?.remark || res?.message)
    }

    return res
  },
  (error) => {
    const status = error.response?.status
    const data = error.response?.data

    if (status === 401 || isAuthExpiredCode(data?.code)) {
      handleAuthExpired(data?.remark || data?.message)
    }

    return Promise.reject(error)
  },
)

export default service
