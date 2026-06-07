// stores/user.js
import { defineStore } from 'pinia'

// 从 localStorage 读取用户信息（初始化）
const loadUserFromStorage = () => {
  const stored = localStorage.getItem('userInfo')
  return stored ? JSON.parse(stored) : null
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: loadUserFromStorage() // 初始值从本地存储读取
  }),

  actions: {
    // 1. 存储用户信息（登录时调用）
    setUserInfo(user) {
      this.userInfo = user
      // 同步到 localStorage 持久化
      localStorage.setItem('userInfo', JSON.stringify(user))
    },

    // 2. 更新用户信息（部分字段，如头像、用户名）
    updateUserInfo(partial) {
      if (!this.userInfo) return // 未登录时不执行
      // 合并更新字段
      this.userInfo = { ...this.userInfo, ...partial }
      // 同步更新本地存储
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },

    // 3. 清除用户信息（退出登录时调用）
    clearUserInfo() {
      this.userInfo = null
      localStorage.removeItem('userInfo') // 清除本地存储
    }
  },

  getters: {
    // 快捷获取 token
    getToken(state) {
      return state.userInfo?.token || ''
    },
    // 判断是否登录
    isLogin(state) {
      return !!state.userInfo?.token
    }
  }
})