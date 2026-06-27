<template>
  <div class="profile-page">
    <!-- 页面头部 -->
    <div class="profile-header">
      <div class="header-left">
        <button class="header-back-btn" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>
      <h1 class="header-title">个人资料</h1>
      <div class="header-right"></div>
    </div>

    <div class="profile-scroll">
      <!-- ===== 头像区域（仅展示） ===== -->
      <div class="avatar-section">
        <div class="avatar-circle">
          <span class="avatar-text">{{ displayAvatarText }}</span>
        </div>
        <h2 class="avatar-nickname">{{ systemUser?.nickName || displayUserName }}</h2>
        <p class="avatar-username">@{{ displayUserName }}</p>
      </div>

      <!-- ===== 信息分组 – iOS 20 Settings 风格 ===== -->
      <div class="settings-section">
        <!-- 昵称 -->
        <div class="settings-row" @click="openNicknameEditor">
          <div class="settings-row-left">
            <div class="settings-icon-box nickname-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="settings-row-body">
              <span class="settings-row-label">昵称</span>
              <span class="settings-row-value">{{ systemUser?.nickName || '未设置' }}</span>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>

        <!-- 用户名 -->
        <div class="settings-row" @click="openUsernameEditor" :class="{ 'disabled-row': usernameModified }">
          <div class="settings-row-left">
            <div class="settings-icon-box username-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div class="settings-row-body">
              <span class="settings-row-label">用户名</span>
              <span class="settings-row-value" :class="{ 'modified-tag': usernameModified }">
                {{ displayUserName }}
                <span v-if="usernameModified" class="badge-modified">已锁定</span>
              </span>
            </div>
          </div>
          <svg v-if="!usernameModified" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>

      <!-- ===== 安全设置分组 ===== -->
      <div class="settings-section-label">安全设置</div>
      <div class="settings-section">
        <!-- 修改密码 -->
        <div class="settings-row" @click="openPasswordEditor">
          <div class="settings-row-left">
            <div class="settings-icon-box password-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div class="settings-row-body">
              <span class="settings-row-label">修改密码</span>
              <span class="settings-row-value hint">安全性高的密码更可靠</span>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>

      <!-- 底部留白 -->
      <div class="profile-spacer"></div>
    </div>

    <!-- 🍎 编辑昵称 Sheet -->
    <ModernSheet v-model="showNicknameSheet" title="修改昵称">
      <div class="sheet-content">
        <div class="sheet-field-group">
          <div class="sheet-field-row">
            <input
              v-model="nicknameForm"
              type="text"
              class="sheet-input"
              placeholder="输入新昵称"
              maxlength="31"
              ref="nicknameInputRef"
              @input="nicknameError = ''"
            />
          </div>
          <p v-if="nicknameError" class="sheet-error">{{ nicknameError }}</p>
        </div>
        <button class="sheet-btn sheet-btn-primary" :disabled="!nicknameForm.trim() || saving" @click="submitNickname">
          <span v-if="saving" class="btn-spinner"></span>
          <span v-else>确认修改</span>
        </button>
        <button class="sheet-btn sheet-btn-ghost" @click="showNicknameSheet = false">取消</button>
      </div>
      <div class="modern-sheet-safe-bottom"></div>
    </ModernSheet>

    <!-- 🍎 编辑用户名 Sheet -->
    <ModernSheet v-model="showUsernameSheet" title="修改用户名">
      <div class="sheet-content">
        <div class="sheet-field-group">
          <div class="sheet-field-row">
            <input
              v-model="usernameForm"
              type="text"
              class="sheet-input"
              placeholder="输入新用户名"
              ref="usernameInputRef"
              @input="usernameError = ''"
            />
          </div>
          <p class="sheet-hint">提示：用户名仅可修改一次，请谨慎操作</p>
          <p v-if="usernameError" class="sheet-error">{{ usernameError }}</p>
        </div>
        <button class="sheet-btn sheet-btn-primary" :disabled="!usernameForm.trim() || saving" @click="submitUsername">
          <span v-if="saving" class="btn-spinner"></span>
          <span v-else>确认修改</span>
        </button>
        <button class="sheet-btn sheet-btn-ghost" @click="showUsernameSheet = false">取消</button>
      </div>
      <div class="modern-sheet-safe-bottom"></div>
    </ModernSheet>

    <!-- 🍎 修改密码 Sheet -->
    <ModernSheet v-model="showPasswordSheet" title="修改密码">
      <div class="sheet-content">
        <div class="sheet-field-group">
          <div class="sheet-field-row">
            <input
              v-model="passwordForm.oldPassword"
              :type="pwdVisible.old ? 'text' : 'password'"
              class="sheet-input"
              placeholder="旧密码"
              @input="passwordError = ''"
            />
            <button class="sheet-pwd-toggle" @click="pwdVisible.old = !pwdVisible.old">
              <svg v-if="pwdVisible.old" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" stroke-width="2" stroke-linecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" stroke-width="2" stroke-linecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <div class="sheet-field-row">
            <input
              v-model="passwordForm.newPassword"
              :type="pwdVisible.new ? 'text' : 'password'"
              class="sheet-input"
              placeholder="新密码 (6-14位)"
              @input="passwordError = ''"
            />
            <button class="sheet-pwd-toggle" @click="pwdVisible.new = !pwdVisible.new">
              <svg v-if="pwdVisible.new" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" stroke-width="2" stroke-linecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" stroke-width="2" stroke-linecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <p v-if="passwordError" class="sheet-error">{{ passwordError }}</p>
        </div>
        <button class="sheet-btn sheet-btn-primary" :disabled="!canSubmitPassword || saving" @click="submitPassword">
          <span v-if="saving" class="btn-spinner"></span>
          <span v-else>确认修改</span>
        </button>
        <button class="sheet-btn sheet-btn-ghost" @click="showPasswordSheet = false">取消</button>
      </div>
      <div class="modern-sheet-safe-bottom"></div>
    </ModernSheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { showNotify } from 'vant'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import {
  updateSystemNickname,
  updateSystemPassword,
  updateSystemUsername,
} from '@/utils/userRequest'
import ModernSheet from '@/components/ModernSheet.vue'

const router = useRouter()
const userStore = useUserStore()
const { userInfo: systemUser } = storeToRefs(userStore)

// 显示信息计算
const displayUserName = computed(() => systemUser.value?.userName || '')
const usernameModified = computed(() => systemUser.value?.usernameModified === 1)

const displayAvatarText = computed(() => {
  const name = systemUser.value?.nickName || systemUser.value?.userName || '?'
  return name.charAt(0).toUpperCase()
})

// 返回
const goBack = () => {
  router.back()
}

// ===== 昵称编辑 =====
const showNicknameSheet = ref(false)
const nicknameForm = ref('')
const nicknameError = ref('')
const nicknameInputRef = ref(null)

const openNicknameEditor = async () => {
  nicknameForm.value = systemUser.value?.nickName || ''
  nicknameError.value = ''
  showNicknameSheet.value = true
  await nextTick()
  nicknameInputRef.value?.focus()
}

const submitNickname = async () => {
  const val = nicknameForm.value.trim()
  if (!val) {
    nicknameError.value = '昵称不能为空'
    return
  }
  if (val.length > 31) {
    nicknameError.value = '昵称不能超过31个字符'
    return
  }
  saving.value = true
  try {
    const res = await updateSystemNickname(val)
    if (res.code === 200) {
      userStore.updateUserInfo({ nickName: val })
      showNotify({ type: 'success', message: '昵称修改成功' })
      showNicknameSheet.value = false
    } else {
      nicknameError.value = res.remark || '修改失败'
    }
  } catch {
    nicknameError.value = '网络异常，请稍后重试'
  } finally {
    saving.value = false
  }
}

// ===== 用户名编辑 =====
const showUsernameSheet = ref(false)
const usernameForm = ref('')
const usernameError = ref('')
const usernameInputRef = ref(null)

const openUsernameEditor = async () => {
  if (usernameModified.value) {
    showNotify({ type: 'warning', message: '用户名仅能修改一次，已无法再次修改' })
    return
  }
  usernameForm.value = systemUser.value?.userName || ''
  usernameError.value = ''
  showUsernameSheet.value = true
  await nextTick()
  usernameInputRef.value?.focus()
}

const submitUsername = async () => {
  const val = usernameForm.value.trim()
  if (!val) {
    usernameError.value = '用户名不能为空'
    return
  }
  if (val === systemUser.value?.userName) {
    usernameError.value = '新用户名与旧用户名一致'
    return
  }
  saving.value = true
  try {
    const res = await updateSystemUsername(val)
    if (res.code === 200) {
      userStore.updateUserInfo({ userName: val, usernameModified: 1 })
      showNotify({ type: 'success', message: '用户名修改成功' })
      showUsernameSheet.value = false
    } else {
      usernameError.value = res.remark || '修改失败'
    }
  } catch {
    usernameError.value = '网络异常，请稍后重试'
  } finally {
    saving.value = false
  }
}

// ===== 密码修改 =====
const showPasswordSheet = ref(false)
const passwordForm = ref({ oldPassword: '', newPassword: '' })
const passwordError = ref('')
const pwdVisible = ref({ old: false, new: false })

const canSubmitPassword = computed(() => {
  return passwordForm.value.oldPassword && passwordForm.value.newPassword
})

const openPasswordEditor = () => {
  passwordForm.value = { oldPassword: '', newPassword: '' }
  passwordError.value = ''
  pwdVisible.value = { old: false, new: false }
  showPasswordSheet.value = true
}

const submitPassword = async () => {
  const { oldPassword, newPassword } = passwordForm.value
  if (!oldPassword || !newPassword) {
    passwordError.value = '请填写完整信息'
    return
  }
  if (newPassword.length < 6) {
    passwordError.value = '密码不能少于6位'
    return
  }
  if (newPassword.length > 14) {
    passwordError.value = '密码不能超过14位'
    return
  }
  saving.value = true
  try {
    const res = await updateSystemPassword(oldPassword, newPassword)
    if (res.code === 200) {
      showNotify({ type: 'success', message: '密码修改成功' })
      showPasswordSheet.value = false
    } else {
      passwordError.value = res.remark || '修改失败'
    }
  } catch {
    passwordError.value = '网络异常，请稍后重试'
  } finally {
    saving.value = false
  }
}

// 共用保存状态
const saving = ref(false)
</script>

<style scoped>
/* ============================================================
   🍎 ProfileView – iOS 20 Settings 风格个人资料页
   品牌色 #ff6767 (粉红)
   参考 apple-card.css 磨砂玻璃体系
   ============================================================ */

.profile-page {
  min-height: 100vh;
  background: #f2f2f7;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Display', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui, sans-serif;
  max-width: 780px;
  margin: 0 auto;
  position: relative;
  box-sizing: border-box;
}

/* ---- 页面头部 ---- */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
  border-bottom: 0.5px solid rgba(60, 60, 67, 0.06);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  width: 44px;
  display: flex;
  align-items: center;
}

.header-back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(142, 142, 147, 0.08);
  border-radius: 50%;
  cursor: pointer;
  color: #007aff;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s;
}
.header-back-btn:active {
  background: rgba(142, 142, 147, 0.16);
}

.header-title {
  font-size: 17px;
  font-weight: 590;
  color: #1d1d1f;
  letter-spacing: -0.2px;
  margin: 0;
}

.header-right {
  width: 44px;
}

/* ---- 可滚动区域 ---- */
.profile-scroll {
  padding: 0 0 40px;
}

/* ---- 头像区域 ---- */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px 24px;
}

.avatar-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6767 0%, #ff8a8a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(255, 103, 103, 0.25);
}

.avatar-text {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.avatar-nickname {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}

.avatar-username {
  font-size: 14px;
  color: #8e8e93;
  margin: 0;
  font-weight: 400;
}

/* ---- 分组标签 ---- */
.settings-section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: #8e8e93;
  padding: 12px 20px 6px;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}

/* ---- 磨砂玻璃分组 ---- */
.settings-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 14px;
  margin: 0 16px;
  overflow: hidden;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.02);
}

/* ---- 行项 ---- */
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  min-height: 48px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s;
}
.settings-row:active {
  background: rgba(142, 142, 147, 0.06);
}
.settings-row + .settings-row {
  border-top: 0.5px solid rgba(60, 60, 67, 0.06);
}
.disabled-row {
  opacity: 0.5;
  cursor: not-allowed;
}
.disabled-row:active {
  background: transparent;
}

.settings-row-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

/* ---- 图标容器 ---- */
.settings-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.nickname-icon {
  background: rgba(255, 103, 103, 0.08);
  color: #ff6767;
}
.username-icon {
  background: rgba(0, 122, 255, 0.08);
  color: #007aff;
}
.password-icon {
  background: rgba(52, 199, 89, 0.08);
  color: #34c759;
}

/* ---- 文本 ---- */
.settings-row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.settings-row-label {
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}
.settings-row-value {
  font-size: 14px;
  color: #8e8e93;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.settings-row-value.hint {
  font-size: 13px;
}
.modified-tag {
  display: flex;
  align-items: center;
  gap: 6px;
}
.badge-modified {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  color: #ff3b30;
  background: rgba(255, 59, 48, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.2px;
}

/* ---- 底部留白 ---- */
.profile-spacer {
  height: 40px;
}

/* ============================================================
   🍎 Sheet 内部表单样式
   ============================================================ */
.sheet-content {
  padding: 0 16px 12px;
}

.sheet-field-group {
  margin-bottom: 4px;
}
.sheet-field-row {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(60, 60, 67, 0.1);
  border-radius: 12px;
  padding: 0 14px;
  margin-bottom: 8px;
  transition: border-color 0.2s;
}
.sheet-field-row:focus-within {
  border-color: #ff6767;
  box-shadow: 0 0 0 3px rgba(255, 103, 103, 0.08);
}

.sheet-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 14px 0;
  font-size: 16px;
  color: #1d1d1f;
  outline: none;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}
.sheet-input::placeholder {
  color: #c7c7cc;
}

.sheet-pwd-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 8px;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s;
}
.sheet-pwd-toggle:active {
  background: rgba(142, 142, 147, 0.08);
}

.sheet-hint {
  font-size: 12px;
  color: #ff9500;
  margin: 0 0 4px 4px;
  font-weight: 400;
}

.sheet-error {
  font-size: 13px;
  color: #ff3b30;
  margin: -4px 0 4px 4px;
  font-weight: 400;
  animation: errorSlideIn 0.2s ease;
}
@keyframes errorSlideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---- 按钮系统 ---- */
.sheet-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 590;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    opacity 0.2s,
    transform 0.15s,
    box-shadow 0.2s;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
  margin-top: 8px;
}
.sheet-btn:active {
  opacity: 0.75;
  transform: scale(0.98);
}
.sheet-btn:disabled {
  background: #e0e0e0;
  color: #fff;
  cursor: not-allowed;
  transform: none;
  opacity: 1;
  box-shadow: none;
}

.sheet-btn-primary {
  background: linear-gradient(135deg, #ff6767 0%, #ff8a8a 100%);
  color: #fff;
  box-shadow: 0 4px 14px rgba(255, 103, 103, 0.25);
}

.sheet-btn-ghost {
  background: transparent;
  color: #ff6767;
  border: 1px solid rgba(255, 103, 103, 0.15);
}
.sheet-btn-ghost:active {
  background: rgba(255, 103, 103, 0.04);
}

/* ---- 加载圈 ---- */
.btn-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ---- 安全区 ---- */
.modern-sheet-safe-bottom {
  height: env(safe-area-inset-bottom, 12px);
}

/* ============================================================
   🍎 暗色模式
   ============================================================ */
@media (prefers-color-scheme: dark) {
  .profile-page {
    background: #000;
  }
  .profile-header {
    background: rgba(0, 0, 0, 0.8);
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }
  .header-title {
    color: #f2f2f7;
  }
  .header-back-btn {
    background: rgba(142, 142, 147, 0.12);
    color: #0a84ff;
  }
  .settings-section {
    background: rgba(30, 30, 35, 0.72);
    border-color: rgba(255, 255, 255, 0.08);
  }
  .settings-row + .settings-row {
    border-top-color: rgba(255, 255, 255, 0.06);
  }
  .settings-row-label {
    color: #f2f2f7;
  }
  .avatar-nickname {
    color: #f2f2f7;
  }
  .sheet-field-row {
    background: rgba(30, 30, 35, 0.72);
    border-color: rgba(255, 255, 255, 0.1);
  }
  .sheet-input {
    color: #f2f2f7;
  }
  .sheet-input::placeholder {
    color: #636366;
  }
  .sheet-btn-primary {
    background: linear-gradient(135deg, #ff6767 0%, #e85a5a 100%);
  }
}
</style>
