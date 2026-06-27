<template>
  <!-- 🍎 个人中心 – ModernSheet（iOS 17 风格），内嵌编辑功能 -->
  <ModernSheet v-model="show" title="个人中心" @closed="onClosed">
    <div class="user-sheet-scroll">
      <!-- ===== 头像区域 ===== -->
      <div class="user-profile-card" v-if="systemUser">
        <div class="user-avatar-wrap">
          <div class="user-avatar-bg">
            <span class="user-avatar-letter">{{ displayAvatarLetter }}</span>
          </div>
        </div>
        <div class="user-meta">
          <h3 class="user-display-name">{{ systemUser.nickName || systemUser.userName }}</h3>
          <p class="user-display-id">{{ systemUser.userName }}</p>
        </div>
      </div>

      <!-- ===== 信息编辑分组 ===== -->
      <div class="user-settings-section">
        <!-- 昵称 -->
        <div class="user-settings-row" @click="openNicknameEditor">
          <div class="settings-row-left">
            <div class="settings-icon-box nickname-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div class="settings-row-body">
              <span class="settings-row-label">昵称</span>
              <span class="settings-row-value">{{ systemUser?.nickName || '未设置' }}</span>
            </div>
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c7c7cc"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>

        <!-- 用户名（仅可修改一次） -->
        <div
          class="user-settings-row"
          :class="{ 'disabled-row': usernameModified }"
          @click="openUsernameEditor"
        >
          <div class="settings-row-left">
            <div class="settings-icon-box username-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div class="settings-row-body">
              <span class="settings-row-label">账号</span>
              <span class="settings-row-value">
                {{ userStore.userInfo?.userName || '' }}
                <span v-if="usernameModified" class="badge-modified">已锁定</span>
                <span v-else class="badge-editable">可修改</span>
              </span>
            </div>
          </div>
          <svg
            v-if="!usernameModified"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c7c7cc"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>

        <!-- 密码 -->
        <div class="user-settings-row" @click="openPasswordEditor">
          <div class="settings-row-left">
            <div class="settings-icon-box password-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div class="settings-row-body">
              <span class="settings-row-label">修改密码</span>
              <span class="settings-row-value hint">点击修改</span>
            </div>
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c7c7cc"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>

      <!-- ===== 退出登录 ===== -->
      <button class="user-logout-btn" @click="handleLogout">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>退出登录</span>
      </button>
    </div>

    <div class="modern-sheet-safe-bottom"></div>
  </ModernSheet>

  <!-- 🍎 昵称编辑 Sheet -->
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
      <button
        class="sheet-btn sheet-btn-primary"
        :disabled="!nicknameForm.trim() || saving"
        @click="submitNickname"
      >
        <span v-if="saving" class="btn-spinner"></span>
        <span v-else>确认修改</span>
      </button>
      <button class="sheet-btn sheet-btn-ghost" @click="showNicknameSheet = false">取消</button>
    </div>
    <div class="modern-sheet-safe-bottom"></div>
  </ModernSheet>

  <!-- 🍎 用户名修改 Sheet（仅一次） -->
  <ModernSheet v-model="showUsernameSheet" title="修改用户名">
    <div class="sheet-content">
      <p class="sheet-tip">用户名仅允许修改一次，请谨慎操作</p>
      <div class="sheet-field-group">
        <div class="sheet-field-row">
          <input
            v-model="usernameForm"
            type="text"
            class="sheet-input"
            placeholder="输入新用户名"
            maxlength="31"
            ref="usernameInputRef"
            @input="usernameError = ''"
          />
        </div>
        <p v-if="usernameError" class="sheet-error">{{ usernameError }}</p>
      </div>
      <button
        class="sheet-btn sheet-btn-primary"
        :disabled="!usernameForm.trim() || saving"
        @click="submitUsername"
      >
        <span v-if="saving" class="btn-spinner"></span>
        <span v-else>确认修改</span>
      </button>
      <button class="sheet-btn sheet-btn-ghost" @click="showUsernameSheet = false">取消</button>
    </div>
    <div class="modern-sheet-safe-bottom"></div>
  </ModernSheet>

  <!-- 🍎 密码修改 Sheet -->
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
            <svg
              v-if="pwdVisible.old"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c7c7cc"
              stroke-width="2"
              stroke-linecap="round"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
              />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <svg
              v-else
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c7c7cc"
              stroke-width="2"
              stroke-linecap="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
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
            <svg
              v-if="pwdVisible.new"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c7c7cc"
              stroke-width="2"
              stroke-linecap="round"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
              />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <svg
              v-else
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c7c7cc"
              stroke-width="2"
              stroke-linecap="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
        <p v-if="passwordError" class="sheet-error">{{ passwordError }}</p>
      </div>
      <button
        class="sheet-btn sheet-btn-primary"
        :disabled="!passwordForm.oldPassword || !passwordForm.newPassword || saving"
        @click="submitPassword"
      >
        <span v-if="saving" class="btn-spinner"></span>
        <span v-else>确认修改</span>
      </button>
      <button class="sheet-btn sheet-btn-ghost" @click="showPasswordSheet = false">取消</button>
    </div>
    <div class="modern-sheet-safe-bottom"></div>
  </ModernSheet>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { showNotify } from 'vant'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import ModernSheet from './ModernSheet.vue'
import {
  updateSystemNickname,
  updateSystemPassword,
  updateSystemUsername,
} from '@/utils/userRequest'

const userStore = useUserStore()
const systemUser = storeToRefs(userStore).userInfo

// v-model
const props = defineProps({ modelValue: { type: Boolean, default: false } })
const emit = defineEmits(['update:modelValue', 'logout'])
const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const onClosed = () => {
  showNicknameSheet.value = false
  showUsernameSheet.value = false
  showPasswordSheet.value = false
}

// ===== 头像 =====
const displayAvatarLetter = computed(() => {
  if (!systemUser.value) return '?'
  const name = systemUser.value.nickName || systemUser.value.userName || '?'
  return name.charAt(0).toUpperCase()
})
const usernameModified = computed(() => systemUser.value?.usernameModified === 1)

// ===== 昵称编辑 =====
const showNicknameSheet = ref(false)
const nicknameForm = ref('')
const nicknameError = ref('')
const nicknameInputRef = ref(null)
const saving = ref(false)

const openNicknameEditor = () => {
  nicknameForm.value = systemUser.value?.nickName || ''
  nicknameError.value = ''
  showNicknameSheet.value = true
  nextTick(() => nicknameInputRef.value?.focus())
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
      showNotify({ type: 'success', message: '✅ 昵称修改成功' })
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

// ===== 用户名编辑（仅一次） =====
const showUsernameSheet = ref(false)
const usernameForm = ref('')
const usernameError = ref('')
const usernameInputRef = ref(null)

const openUsernameEditor = () => {
  if (usernameModified.value) return // 已锁定，不可修改
  usernameForm.value = systemUser.value?.userName || ''
  usernameError.value = ''
  showUsernameSheet.value = true
  nextTick(() => {
    usernameInputRef.value?.focus()
    // 如果现有用户名不符合长度要求，给出提示
    const currentVal = usernameForm.value
    if (currentVal && currentVal.length < 6) {
      usernameError.value = '当前用户名过短，修改后至少需要6个字符'
    }
  })
}

const submitUsername = async () => {
  const val = usernameForm.value.trim()
  if (!val) {
    usernameError.value = '用户名不能为空'
    return
  }
  if (val.length < 6) {
    usernameError.value = '用户名至少需要6个字符'
    return
  }
  if (val.length > 31) {
    usernameError.value = '用户名不能超过31个字符'
    return
  }
  if (!/^[a-zA-Z0-9@._-]+$/.test(val)) {
    usernameError.value = '用户名只能包含字母、数字、@、.、_、-'
    return
  }
  saving.value = true
  try {
    const res = await updateSystemUsername(val)
    if (res.code === 200) {
      // 更新本地用户信息：用户名 和 usernameModified 标志
      userStore.updateUserInfo({ userName: val, usernameModified: 1 })
      showNotify({ type: 'success', message: '✅ 用户名修改成功' })
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

const openPasswordEditor = () => {
  passwordForm.value = { oldPassword: '', newPassword: '' }
  passwordError.value = ''
  pwdVisible.value = { old: false, new: false }
  showPasswordSheet.value = true
}

const submitPassword = async () => {
  const { oldPassword, newPassword } = passwordForm.value
  if (!oldPassword || !newPassword) {
    passwordError.value = '请填写旧密码和新密码'
    return
  }
  if (newPassword.length < 6 || newPassword.length > 14) {
    passwordError.value = '新密码长度必须在6到14位之间'
    return
  }
  saving.value = true
  try {
    const res = await updateSystemPassword(oldPassword, newPassword)
    if (res.code === 200) {
      showNotify({ type: 'success', message: '✅ 密码修改成功' })
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

// ===== 退出登录 =====
const handleLogout = () => {
  show.value = false
  emit('logout')
}
</script>

<style scoped>
.user-sheet-scroll {
  max-height: 70vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 头像卡片 */
.user-profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px 16px;
}
.user-avatar-wrap {
  margin-bottom: 10px;
}
.user-avatar-bg {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6767 0%, #ff8a8a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(255, 103, 103, 0.25);
}
.user-avatar-letter {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}
.user-meta {
  text-align: center;
}
.user-display-name {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 2px;
  letter-spacing: -0.3px;
}
.user-display-id {
  font-size: 14px;
  color: #8e8e93;
  margin: 0;
  font-weight: 400;
}

/* 设置分组（iOS Settings 白底圆角卡片） */
.user-settings-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border-radius: 14px;
  margin: 0 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.user-settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 10px 16px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s;
  gap: 8px;
}
.user-settings-row:active {
  background: rgba(142, 142, 147, 0.06);
}
.user-settings-row + .user-settings-row {
  border-top: 0.5px solid rgba(60, 60, 67, 0.06);
}
.user-settings-row.disabled-row {
  opacity: 0.55;
  cursor: default;
}
.user-settings-row.disabled-row:active {
  background: transparent;
}
.settings-row-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.settings-icon-box {
  width: 30px;
  height: 30px;
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
  background: rgba(255, 149, 0, 0.08);
  color: #ff9500;
}
.settings-row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.settings-row-label {
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
}
.settings-row-value {
  font-size: 12px;
  color: #8e8e93;
  display: flex;
  align-items: center;
  gap: 6px;
}
.settings-row-value.hint {
  color: #c7c7cc;
  font-style: italic;
}
.badge-modified {
  display: inline-flex;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(0, 122, 255, 0.08);
  color: #007aff;
  font-size: 10px;
  font-weight: 600;
}
.badge-editable {
  display: inline-flex;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(52, 199, 89, 0.08);
  color: #34c759;
  font-size: 10px;
  font-weight: 600;
}

/* 退出登录 */
.user-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 32px);
  margin: 16px 16px 0;
  padding: 14px;
  border: none;
  border-radius: 14px;
  background: rgba(255, 59, 48, 0.08);
  color: #ff3b30;
  font-size: 16px;
  font-weight: 590;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}
.user-logout-btn:active {
  background: rgba(255, 59, 48, 0.15);
  transform: scale(0.98);
}

/* ============================================================
   🍎 内嵌 Sub-Sheet 表单样式
   ============================================================ */
.sheet-content {
  padding: 0 16px 8px;
}
.sheet-field-group {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.sheet-field-row {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 0 16px;
  gap: 8px;
}
.sheet-field-row + .sheet-field-row {
  border-top: 0.5px solid rgba(60, 60, 67, 0.06);
}
.sheet-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  padding: 14px 0;
  color: #1d1d1f;
  outline: none;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
  min-width: 0;
}
.sheet-input::placeholder {
  color: #c7c7cc;
}
.sheet-pwd-toggle {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  border-radius: 6px;
}
.sheet-pwd-toggle:active {
  background: rgba(142, 142, 147, 0.06);
}
.sheet-error {
  color: #ff3b30;
  font-size: 13px;
  margin: 8px 16px;
}
.sheet-tip {
  color: #ff9500;
  font-size: 13px;
  margin: 0 0 12px;
  padding: 10px 14px;
  background: rgba(255, 149, 0, 0.08);
  border-radius: 10px;
  line-height: 1.4;
}

/* 按钮 */
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
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
  margin-top: 12px;
}
.sheet-btn:active {
  transform: scale(0.98);
}
.sheet-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
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

/* 加载圈 */
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
  to {
    transform: rotate(360deg);
  }
}

.modern-sheet-safe-bottom {
  height: env(safe-area-inset-bottom, 12px);
}

/* 暗色 */
@media (prefers-color-scheme: dark) {
  .user-display-name {
    color: #f2f2f7;
  }
  .user-settings-section,
  .sheet-field-group {
    background: rgba(30, 30, 35, 0.72);
    border-color: rgba(255, 255, 255, 0.08);
  }
  .user-settings-row + .user-settings-row,
  .sheet-field-row + .sheet-field-row {
    border-top-color: rgba(255, 255, 255, 0.06);
  }
  .settings-row-label {
    color: #f2f2f7;
  }
  .sheet-input {
    color: #f2f2f7;
  }
  .sheet-input::placeholder {
    color: #636366;
  }
  .sheet-tip {
    background: rgba(255, 149, 0, 0.12);
    color: #ffb340;
  }
}
</style>
