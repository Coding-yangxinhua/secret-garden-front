import { defineStore } from 'pinia'

const loadUserFromStorage = () => {
  const stored = localStorage.getItem('userInfo')
  return stored ? JSON.parse(stored) : null
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: loadUserFromStorage(),
    sessionExpired: false,
  }),

  actions: {
    setUserInfo(user) {
      this.userInfo = user
      this.sessionExpired = false
      localStorage.setItem('userInfo', JSON.stringify(user))
    },

    updateUserInfo(partial) {
      if (!this.userInfo) return
      this.userInfo = { ...this.userInfo, ...partial }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },

    clearUserInfo() {
      this.userInfo = null
      localStorage.removeItem('userInfo')
    },

    markSessionExpired() {
      this.sessionExpired = true
      this.clearUserInfo()
    },
  },

  getters: {
    getToken(state) {
      return state.userInfo?.token || ''
    },

    isLogin(state) {
      return !!state.userInfo?.token
    },
  },
})
