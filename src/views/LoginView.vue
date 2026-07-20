<template>
  <div class="login-register-container">
    <!-- 可爱背景装饰 -->
    <div class="background-decorations">
      <div class="float-item star-1">⭐</div>
      <div class="float-item star-2">✨</div>
      <div class="float-item heart-1">💖</div>
      <div class="float-item heart-2">💕</div>
      <div class="float-item cloud-1">☁️</div>
      <div class="float-item cloud-2">☁️</div>
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="leaf leaf-1">🍃</div>
    </div>

    <div class="main-card">
      <!-- 顶部可爱装饰 -->
      <div class="top-decoration">
        <div class="pink-ribbon"></div>
        <div class="dot dot-1"></div>
        <div class="dot dot-2"></div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 标题 -->
        <div class="title-section">
          <h1 class="main-title">{{ isRegistering ? '注册账号' : '欢迎登录' }}</h1>
          <p class="sub-title">
            ✨ {{ isRegistering ? '注册一个账号开始使用吧' : '请登录小助手后继续操作' }} ✨
          </p>
        </div>

        <!-- 切换按钮 -->
        <div class="tabs-section">
          <div class="tabs-wrapper">
            <button :class="['tab-btn', { active: !isRegistering }]" @click="switchToLogin">
              登录
            </button>
            <button :class="['tab-btn', { active: isRegistering }]" @click="switchToRegister">
              注册
            </button>
            <div class="slider" :class="{ 'slide-right': isRegistering }"></div>
          </div>
        </div>

        <!-- 登录表单 -->
        <div v-if="!isRegistering" class="form-section">
          <div class="input-group">
            <label class="input-label">账号</label>
            <div class="input-wrapper">
              <cute-icon name="user" size="18" color="#f8a1d1" style="margin-right: 5px" />
              <input
                v-model="loginForm.userName"
                type="text"
                placeholder="请输入小助手账号"
                class="form-input"
                @blur="validateLoginUsername"
              />
            </div>
            <div v-if="loginErrors.username" class="error-message">{{ loginErrors.username }}</div>
          </div>

          <div class="input-group">
            <label class="input-label">密码</label>
            <div class="input-wrapper">
              <cute-icon name="lock" size="18" color="#f8a1d1" style="margin-right: 5px" />
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入你的密码"
                class="form-input"
                @blur="validateLoginPassword"
              />
              <button class="password-toggle" @click="togglePasswordVisibility">
                <cute-icon
                  v-if="showPassword"
                  name="eye"
                  size="18"
                  color="#f8a1d1"
                  style="margin-right: 5px"
                />
                <cute-icon
                  v-else
                  name="eye-crossed"
                  size="18"
                  color="#f8a1d1"
                  style="margin-right: 5px"
                />
              </button>
            </div>
            <div v-if="loginErrors.password" class="error-message">{{ loginErrors.password }}</div>
          </div>

          <div class="options-row">
            <label class="checkbox-group">
              <input v-model="loginForm.remember" type="checkbox" class="custom-checkbox" />
              <span class="checkmark"></span>
              <span class="checkbox-text">记住密码</span>
            </label>
            <button class="forgot-link" @click="handleForgotPassword">忘记密码？</button>
          </div>

          <button
            class="submit-btn"
            @click="onLoginSubmit"
            :disabled="isLoading || !isLoginFormValid"
          >
            <span v-if="!isLoading">立即登录</span>
            <div v-else class="spinner"></div>
          </button>
        </div>

        <!-- 注册表单 -->
        <div v-else class="form-section">
          <div class="input-group">
            <label class="input-label">账号</label>
            <div class="input-wrapper">
              <cute-icon name="user" size="18" color="#f8a1d1" style="margin-right: 5px" />
              <input
                v-model="registerForm.userName"
                type="text"
                placeholder="请输入账号"
                class="form-input"
                @blur="validateRegisterUsername"
              />
            </div>
            <div v-if="registerErrors.username" class="error-message">
              {{ registerErrors.username }}
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">密码</label>
            <div class="input-wrapper">
              <cute-icon name="lock" size="18" color="#f8a1d1" style="margin-right: 5px" />
              <input
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="设置一个安全的密码哦"
                class="form-input"
                @blur="validateRegisterPassword"
              />
              <button class="password-toggle" @click="togglePasswordVisibility">
                <cute-icon
                  v-if="showPassword"
                  name="eye"
                  size="18"
                  color="#f8a1d1"
                  style="margin-right: 5px"
                />
                <cute-icon
                  v-else
                  name="eye-crossed"
                  size="18"
                  color="#f8a1d1"
                  style="margin-right: 5px"
                />
              </button>
            </div>
            <div v-if="registerErrors.password" class="error-message">
              {{ registerErrors.password }}
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">确认密码</label>
            <div class="input-wrapper">
              <cute-icon name="lock" size="18" color="#f8a1d1" style="margin-right: 5px" />
              <input
                v-model="registerForm.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="再输一遍确认一下"
                class="form-input"
                @blur="validateConfirmPassword"
              />
            </div>
            <div v-if="registerErrors.confirmPassword" class="error-message">
              {{ registerErrors.confirmPassword }}
            </div>
          </div>

          <!-- 邀请码输入框 -->
          <div class="input-group">
            <label class="input-label">邀请码</label>
            <div class="input-wrapper">
              <cute-icon name="plane" size="18" color="#f8a1d1" style="margin-right: 5px" />
              <input
                v-model="registerForm.inviteCode"
                type="text"
                placeholder="可以不填哦"
                class="form-input"
              />
            </div>
            <div v-if="registerErrors.inviteCode" class="error-message">
              {{ registerErrors.inviteCode }}
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">验证码</label>
            <div class="input-wrapper">
              <cute-icon name="shield" size="18" color="#f8a1d1" style="margin-right: 5px" />
              <input
                style="width: 80%"
                v-model="registerForm.code"
                type="text"
                placeholder="输入右边的小字符"
                class="form-input"
                @blur="validateCode"
              />
              <button class="captcha-btn" @click="generateCaptcha">
                {{ captchaText }}
              </button>
            </div>
            <div v-if="registerErrors.code" class="error-message">{{ registerErrors.code }}</div>
          </div>

          <div class="agreement-section">
            <label class="checkbox-group">
              <input
                v-model="registerForm.agreed"
                type="checkbox"
                class="custom-checkbox"
                @change="validateAgreement"
              />
              <span class="checkmark"></span>
              <span class="checkbox-text">
                我同意 <span class="link">服务条款</span> 和
                <span class="link">隐私政策</span>
              </span>
            </label>
            <div v-if="registerErrors.agreed" class="error-message">
              {{ registerErrors.agreed }}
            </div>
          </div>

          <button
            class="submit-btn"
            @click="onRegisterSubmit"
            :disabled="isLoading || !isRegisterFormValid"
          >
            <span v-if="!isLoading">立即注册</span>
            <div v-else class="spinner"></div>
          </button>
        </div>
      </div>

      <!-- 底部可爱装饰 -->
      <div class="bottom-decoration">
        <div class="pink-ribbon-bottom"></div>
        <div class="cute-footer">💖</div>
      </div>
    </div>

    <RegistrationCredentialModal
      v-model="showRegistrationSuccess"
      :username="registrationResult.username"
      :password="registrationResult.password"
      @close="closeSuccessModal"
    />

    <!-- 忘记密码查询 Sheet -->
    <ModernSheet v-model="showForgotDialog" title="找回小助手账号">
      <div class="forgot-sheet-content">
        <div class="forgot-body">
          <p class="success-message forgot-description">输入游戏账号，查看已绑定的小助手账号。</p>
          <div class="input-group forgot-search-field">
            <label class="input-label forgot-input-label">游戏账号</label>
            <div class="input-wrapper">
              <cute-icon name="user" size="18" color="#f8a1d1" style="margin-right: 5px" />
              <input
                v-model="forgotGameUserName"
                type="text"
                placeholder="请输入游戏账号"
                class="form-input"
              />
            </div>
          </div>

          <!-- 查询成功 - 显示结构化结果 -->
          <div
            v-if="forgotResult && forgotResult.type === 'success'"
            class="query-result-card result-card-success"
          >
            <div class="result-header">
              <span class="result-icon" aria-hidden="true"></span>
              <span class="result-title">已找到绑定账号</span>
            </div>
            <div class="result-body">
          
              <div class="result-row">
                <span class="result-label">小助手账号</span>
                <span class="result-value system-account">{{ forgotResult.systemAccount }}</span>
              </div>
            </div>
            <div class="result-footer">
              <span class="result-hint">请使用该账号登录小助手，如忘记密码请联系小助手。</span>
            </div>
          </div>

          <!-- 查询失败 - 未绑定 -->
          <div
            v-if="forgotResult && forgotResult.type === 'not_bound'"
            class="query-result-card result-card-warning"
          >
            <div class="result-header">
              <span class="result-icon" aria-hidden="true"></span>
              <span class="result-title">未找到绑定关系</span>
            </div>
            <div class="result-body">
              <div class="result-row">
                <span class="result-label">游戏账号</span>
                <span class="result-value game-account">{{ forgotResult.gameAccount }}</span>
              </div>
            </div>
            <div class="result-footer">
              <span class="result-hint"
                >该游戏账号暂未绑定小助手账号，请先<a
                  class="result-link"
                  @click="closeForgotDialog"
                  >注册账号</a
                ></span
              >
            </div>
          </div>

          <!-- 查询失败 - 错误 -->
          <div
            v-if="forgotResult && forgotResult.type === 'error'"
            class="query-result-card result-card-error"
          >
            <div class="result-header">
              <span class="result-icon" aria-hidden="true"></span>
              <span class="result-title">查询失败</span>
            </div>
            <div class="result-body">
              <p class="error-reason">{{ forgotResult.message }}</p>
            </div>
            <div class="result-footer">
              <span class="result-hint">请检查账号是否正确，稍后重试。</span>
            </div>
          </div>
        </div>
        <div class="forgot-actions">
          <button class="close-btn" @click="queryForgotAccount" :disabled="isQuerying">
            {{ isQuerying ? '查询中...' : '查询账号' }}
          </button>
          <button class="close-btn forgot-secondary-btn" @click="closeForgotDialog">
            关闭
          </button>
        </div>
        <div class="modern-sheet-safe-bottom"></div>
      </div>
    </ModernSheet>
  </div>
</template>

<script setup>
import { showNotify } from 'vant'
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { userLogin, userReg, queryBoundSystemUser } from '@/utils/userRequest'
import CuteIcon from '@/components/CuteIcon.vue'
import ModernSheet from '@/components/ModernSheet.vue'
import RegistrationCredentialModal from '@/components/RegistrationCredentialModal.vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const isRegistering = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const captchaText = ref('ABCD')
const showRegistrationSuccess = ref(false)
const registrationResult = reactive({
  username: '',
  password: '',
})

// 获取URL中的邀请码参数
const getInviteCodeFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('inviteCode') || ''
}

// 登录表单数据
const loginForm = reactive({
  userName: '',
  password: '',
  remember: false,
})

// 注册表单数据
const registerForm = reactive({
  userName: '',
  password: '',
  confirmPassword: '',
  inviteCode: getInviteCodeFromUrl(), // 从URL获取邀请码
  code: '',
  agreed: false,
})

// 登录错误信息
const loginErrors = reactive({
  username: '',
  password: '',
})

// 注册错误信息
const registerErrors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  inviteCode: '',
  code: '',
  agreed: '',
})

// 从本地存储加载记住的登录信息
const loadRememberedCredentials = () => {
  try {
    // 加载记住的账号
    const rememberedAccount = localStorage.getItem('rememberedAccount')
    if (rememberedAccount) {
      loginForm.userName = rememberedAccount
    }

    // 加载记住的完整登录信息（包括密码）
    const rememberedData = localStorage.getItem('rememberedLogin')
    if (rememberedData) {
      const parsedData = JSON.parse(rememberedData)
      loginForm.userName = parsedData.userName || loginForm.userName // 如果已有账号则保留
      loginForm.password = parsedData.password || ''
      loginForm.remember = parsedData.remember || false

      // 如果记住密码，则自动勾选记住密码复选框
      if (parsedData.remember) {
        loginForm.remember = true
      }
    }
  } catch (error) {
    console.error('加载记住的登录信息失败:', error)
  }
}

// 保存登录信息到本地存储
const saveRememberedCredentials = () => {
  // 始终保存账号
  if (loginForm.userName) {
    try {
      localStorage.setItem('rememberedAccount', loginForm.userName)
    } catch (error) {
      console.error('保存账号失败:', error)
    }
  }

  // 只有在勾选记住密码时才保存密码
  if (loginForm.remember && loginForm.password) {
    const dataToSave = {
      userName: loginForm.userName,
      password: loginForm.password,
      remember: loginForm.remember,
    }
    try {
      localStorage.setItem('rememberedLogin', JSON.stringify(dataToSave))
    } catch (error) {
      console.error('保存登录信息失败:', error)
      showNotify({ type: 'warning', message: '浏览器隐私模式下无法保存登录信息' })
    }
  } else {
    // 如果没有勾选记住密码，只保存账号，清除完整登录信息
    localStorage.removeItem('rememberedLogin')
  }
}

// 清除记住的登录信息
const clearRememberedCredentials = () => {
  localStorage.removeItem('rememberedLogin')
  localStorage.removeItem('rememberedAccount')
}

// 生成验证码
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaText.value = result
  // 清除验证码错误信息
  registerErrors.code = ''
}

// 切换到登录
const switchToLogin = () => {
  isRegistering.value = false
  // 清空登录错误信息
  Object.keys(loginErrors).forEach((key) => (loginErrors[key] = ''))
}

// 切换到注册
const switchToRegister = () => {
  isRegistering.value = true
  // 清空注册错误信息
  Object.keys(registerErrors).forEach((key) => (registerErrors[key] = ''))
}

// 切换密码可见性
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// 登录表单验证
const validateLoginUsername = () => {
  if (!loginForm.userName.trim()) {
    loginErrors.username = '请输入账号哦~'
  } else {
    loginErrors.username = ''
  }
}

const validateLoginPassword = () => {
  if (!loginForm.password) {
    loginErrors.password = '请输入密码哦~'
  } else {
    loginErrors.password = ''
  }
}

// 计算登录表单是否有效
const isLoginFormValid = computed(() => {
  return (
    !loginErrors.username &&
    !loginErrors.password &&
    loginForm.userName.trim() &&
    loginForm.password
  )
})

// 注册表单验证
const validateRegisterUsername = () => {
  if (!registerForm.userName.trim()) {
    registerErrors.username = '请输入账号哦~'
  } else if (registerForm.userName.length < 6) {
    registerErrors.username = '账号至少6个字符'
  } else if (!/^[a-zA-Z0-9@._-]+$/.test(registerForm.userName)) {
    registerErrors.username = '账号只能包含字母、数字、@、.、_、-'
  } else {
    registerErrors.username = ''
  }
}

const validateRegisterPassword = () => {
  if (!registerForm.password) {
    registerErrors.password = '请输入密码啦~'
  } else if (registerForm.password.length < 6) {
    registerErrors.password = '密码至少6个字符'
  } else {
    registerErrors.password = ''
  }
}

const validateConfirmPassword = () => {
  if (!registerForm.confirmPassword) {
    registerErrors.confirmPassword = '请确认密码'
  } else if (registerForm.password !== registerForm.confirmPassword) {
    registerErrors.confirmPassword = '两次输入的密码不一致呢'
  } else {
    registerErrors.confirmPassword = ''
  }
}

const validateCode = () => {
  if (!registerForm.code) {
    registerErrors.code = '请输入验证码哦~'
  } else if (registerForm.code.toUpperCase() !== captchaText.value.toUpperCase()) {
    registerErrors.code = '验证码不对呢，再试试看？'
    generateCaptcha() // 重新生成验证码
  } else {
    registerErrors.code = ''
  }
}

const validateAgreement = () => {
  if (!registerForm.agreed) {
    registerErrors.agreed = '请同意服务条款和隐私政策哦~'
  } else {
    registerErrors.agreed = ''
  }
}

// 计算注册表单是否有效
const isRegisterFormValid = computed(() => {
  return (
    !registerErrors.username &&
    !registerErrors.password &&
    !registerErrors.confirmPassword &&
    !registerErrors.code &&
    !registerErrors.agreed &&
    registerForm.userName.trim() &&
    registerForm.password &&
    registerForm.confirmPassword &&
    registerForm.code &&
    registerForm.agreed
  )
})

// 登录提交
const onLoginSubmit = async () => {
  // 触发所有验证
  validateLoginUsername()
  validateLoginPassword()

  if (!isLoginFormValid.value) {
    return
  }

  isLoading.value = true
  try {
    let result = await userLogin(loginForm)
    const { code, data, remark } = result
    if (code === 200) {
      showNotify({ type: 'success', message: '登录成功！' })
      userStore.setUserInfo(data)

      // 登录成功后，根据用户选择保存登录信息
      saveRememberedCredentials()

      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
      router.push(redirect || { name: 'home' })
    } else {
      // 登录失败，显示错误信息
      showNotify({ type: 'danger', message: remark })
    }
  } catch (error) {
    showNotify({ type: 'danger', message: '登录失败，请稍后再试' })
  } finally {
    isLoading.value = false
  }
}

// 注册提交
const onRegisterSubmit = async () => {
  // 触发所有验证
  validateRegisterUsername()
  validateRegisterPassword()
  validateConfirmPassword()
  validateCode()
  validateAgreement()
  if (!isRegisterFormValid.value) {
    return
  }
  isLoading.value = true
  try {
    let result = await userReg(registerForm)
    const { code, remark } = result
    if (code === 200) {
      showNotify({ type: 'success', message: '注册成功！' })
      // 保存注册成功的账号和密码信息
      registrationResult.username = registerForm.userName
      registrationResult.password = registerForm.password
      // 显示成功提示弹窗
      showRegistrationSuccess.value = true
    } else {
      // 注册失败，显示错误信息
      showNotify({ type: 'danger', message: remark })
    }
  } catch (error) {
    showNotify({ type: 'danger', message: '注册失败，请稍后再试！' })
  } finally {
    isLoading.value = false
  }
}

// 关闭成功提示弹窗
const closeSuccessModal = () => {
  showRegistrationSuccess.value = false
  // 清空注册结果信息
  registrationResult.username = ''
  registrationResult.password = ''
  switchToLogin()
}

// 忘记密码处理 — 查询绑定的系统账号
const forgotGameUserName = ref('')
const forgotResult = ref(null)
const showForgotDialog = ref(false)
const isQuerying = ref(false)

const handleForgotPassword = () => {
  forgotGameUserName.value = ''
  forgotResult.value = null
  showForgotDialog.value = true
}

const queryForgotAccount = async () => {
  if (!forgotGameUserName.value.trim()) {
    showNotify({ type: 'warning', message: '请输入游戏用户名' })
    return
  }
  isQuerying.value = true
  try {
    const res = await queryBoundSystemUser(forgotGameUserName.value.trim())
    const gameAccount = forgotGameUserName.value.trim()
    if (res.code === 200) {
      if (res.data) {
        forgotResult.value = {
          type: 'success',
          gameAccount,
          systemAccount: res.data,
        }
      } else {
        forgotResult.value = {
          type: 'not_bound',
          gameAccount,
        }
      }
    } else {
      forgotResult.value = {
        type: 'error',
        gameAccount,
        message: res.remark || '未知错误',
      }
    }
  } catch {
    forgotResult.value = {
      type: 'error',
      gameAccount: forgotGameUserName.value.trim(),
      message: '网络异常，请稍后重试',
    }
  } finally {
    isQuerying.value = false
  }
}

const closeForgotDialog = () => {
  showForgotDialog.value = false
}

// 初始化验证码和加载记住的登录信息
onMounted(() => {
  generateCaptcha()
  loadRememberedCredentials()
})
</script>

<style scoped>
/* 可爱风格主容器 */
.login-register-container {
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(254, 246, 249, 0.96) 0%, rgba(242, 242, 247, 0.98) 52%),
    #f2f2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  font-family:
    'Helvetica Neue',
    'Arial',
    'PingFang SC',
    'Microsoft YaHei',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  position: relative;
  overflow: auto;
}

.login-register-container::before {
  display: none;
}

/* 可爱浮动装饰 */
.background-decorations {
  display: none;
}

.float-item {
  position: absolute;
  font-size: 22px;
  opacity: 0;
  animation: none;
}

.star-1 {
  top: 12%;
  left: 10%;
  animation-delay: 0s;
}
.star-2 {
  top: 65%;
  right: 12%;
  animation-delay: 1.5s;
}
.heart-1 {
  bottom: 18%;
  left: 15%;
  animation-delay: 0.5s;
}
.heart-2 {
  top: 30%;
  right: 20%;
  animation-delay: 2s;
}
.cloud-1 {
  top: 8%;
  right: 25%;
  animation-delay: 1s;
}
.cloud-2 {
  bottom: 25%;
  left: 22%;
  animation-delay: 2.5s;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.46), rgba(244, 114, 182, 0.12)),
    rgba(236, 72, 153, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.34);
  filter: blur(0.2px);
  animation: none;
}

.circle-1 {
  width: 90px;
  height: 90px;
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.circle-2 {
  width: 60px;
  height: 60px;
  bottom: 15%;
  right: 10%;
  animation-delay: 3s;
}

.leaf {
  position: absolute;
  font-size: 22px;
  animation: none;
  opacity: 0;
  bottom: 22%;
  right: 20%;
}

@keyframes cute-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(10deg);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(180deg);
  }
}

@keyframes float-pulse {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.15);
  }
}

/* 可爱主卡片 */
.main-card {
  width: 100%;
  max-width: 430px;
  background: rgba(255, 255, 255, 0.74);
  backdrop-filter: blur(18px) saturate(1.2);
  -webkit-backdrop-filter: blur(18px) saturate(1.2);
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  overflow: visible;
  position: relative;
  box-shadow:
    0 18px 42px rgba(180, 120, 140, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  z-index: 2;
  animation: card-pop 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.main-card::before {
  display: none;
}

.main-card > * {
  position: relative;
  z-index: 1;
}

@keyframes card-pop {
  0% {
    transform: translateY(8px) scale(0.98);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* 顶部可爱装饰条 */
.top-decoration {
  display: none;
}

.pink-ribbon {
  display: none;
}

.dot {
  display: none;
}

.dot-1 {
  left: 25%;
}
.dot-2 {
  right: 25%;
}

/* 底部可爱装饰 */
.bottom-decoration {
  height: 0;
  background: transparent;
  position: relative;
  border-radius: 0 0 18px 18px;
}

.pink-ribbon-bottom {
  display: none;
}

.cute-footer {
  display: none;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.25);
  }
}

/* 内容区域 */
.content-area {
  padding: 34px 28px 30px;
}

/* 标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 28px;
}

.title-section::before {
  content: '';
  display: block;
  width: 62px;
  height: 62px;
  margin: 0 auto 18px;
  border-radius: 18px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.54), transparent 45%),
    linear-gradient(135deg, #f472b6, #ec4899);
  box-shadow:
    0 10px 24px rgba(236, 72, 153, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.48);
}

.main-title {
  color: #1d1d1f;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: 0;
  text-shadow: none;
}

.sub-title {
  color: #6b6b70;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
  opacity: 1;
}

/* 切换选项卡 */
.tabs-section {
  margin-bottom: 24px;
}

.tabs-wrapper {
  position: relative;
  display: flex;
  background: rgba(118, 118, 128, 0.12);
  border-radius: 12px;
  padding: 3px;
  height: 42px;
  border: 0;
  box-shadow: none;
}

.tab-btn {
  flex: 1;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 500;
  color: #6b6b70;
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.tab-btn.active {
  color: #1d1d1f;
  font-weight: 600;
}

.slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc(50% - 3px);
  height: 36px;
  background: #ffffff;
  border-radius: 9px;
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.slider.slide-right {
  transform: translateX(100%);
}

/* 表单区域 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  color: #6b6b70;
  font-size: 13px;
  font-weight: 500;
  margin-left: 6px;
}

/* 可爱输入框 */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(60, 60, 67, 0.12);
  border-radius: 13px;
  padding: 0 14px;
  box-shadow: 0 1px 2px rgba(60, 60, 67, 0.04);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #ec4899;
  box-shadow:
    0 0 0 3px rgba(244, 114, 182, 0.12),
    0 1px 2px rgba(60, 60, 67, 0.04);
}

.input-icon {
  width: 18px;
  height: 18px;
  margin-right: 10px;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  border: none;
  padding: 13px 0;
  font-size: 15px;
  background: transparent;
  outline: none;
  color: #1d1d1f;
}

.form-input::placeholder {
  color: #aeaeb2;
  opacity: 1;
}

.password-toggle {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  background-color: rgba(255, 255, 255, 0.42);
}

.eye-icon {
  width: 18px;
  height: 18px;
}

/* 验证码按钮 */
.captcha-btn {
  background: linear-gradient(135deg, #f472b6, #ec4899);
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    box-shadow 0.2s ease,
    opacity 0.2s ease;
  width: 72px;
}

/* 选项行 */
.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

/* 可爱复选框 */
.checkbox-group {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  color: #6b6b70;
  font-size: 13px;
  font-weight: 500;
}

.custom-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  width: 18px;
  height: 18px;
  background-color: #fff;
  border: 1.5px solid rgba(244, 114, 182, 0.36);
  border-radius: 6px;
  margin-right: 8px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-checkbox:checked + .checkmark {
  background-color: #ec4899;
  border-color: #ec4899;
}

.custom-checkbox:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 11px;
  font-weight: bold;
}

.checkbox-text {
  line-height: 1.4;
}

.forgot-link {
  background: none;
  border: none;
  color: #ec4899;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 8px;
  transition:
    background 0.2s ease,
    color 0.2s ease;
  font-weight: 500;
}

.forgot-link:hover {
  color: #db2777;
  background-color: rgba(244, 114, 182, 0.08);
}

.agreement-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.agreement-section .checkbox-group {
  align-items: flex-start;
  line-height: 1.5;
}

.link {
  color: #ec4899;
  cursor: pointer;
  font-weight: 500;
}

.link:hover {
  color: #db2777;
  text-decoration: underline;
}

/* 可爱提交按钮 */
.submit-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #f472b6, #ec4899);
  color: white;
  border: none;
  border-radius: 13px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition:
    box-shadow 0.2s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
  box-shadow:
    0 8px 18px rgba(236, 72, 153, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.36);
  letter-spacing: 0;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    0 10px 22px rgba(236, 72, 153, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 错误提示 */
.error-message {
  color: #f43f5e;
  font-size: 12px;
  font-weight: 500;
  margin-top: 3px;
  padding-left: 6px;
  animation: error-pop 0.3s ease;
}

@keyframes error-pop {
  0% {
    opacity: 0;
    transform: translateY(-4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 可爱弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(18px) saturate(1.15);
  -webkit-backdrop-filter: blur(18px) saturate(1.15);
  border-radius: 20px;
  padding: 28px;
  max-width: 380px;
  width: 90%;
  box-shadow: 0 18px 45px rgba(60, 60, 67, 0.16);
  animation: modal-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(60, 60, 67, 0.08);
}

@keyframes modal-pop {
  0% {
    transform: translateY(8px) scale(0.98);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 20px;
}

.modal-title {
  color: #1d1d1f;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.modal-body {
  text-align: center;
  margin-bottom: 25px;
}

.success-message {
  color: #6b6b70;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 15px 0;
}

.account-info {
  background: #f7f7fb;
  border: 1px solid rgba(60, 60, 67, 0.08);
  border-radius: 16px;
  padding: 18px;
  margin: 15px 0;
  text-align: left;
}

.account-info p {
  margin: 8px 0;
  color: #1d1d1f;
  font-size: 15px;
}

.warning-message {
  color: #f43f5e;
  font-size: 14px;
  font-weight: 500;
  margin: 15px 0 0 0;
}

/* 查询结果卡片 */
.query-result-card {
  background: #ffffff;
  border: 1px solid rgba(60, 60, 67, 0.08);
  border-radius: 16px;
  overflow: hidden;
  margin: 16px 0;
  animation: result-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes result-pop {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.result-header {
  background: #fdf2f8;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-icon {
  font-size: 18px;
}

.result-title {
  color: #ec4899;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0;
}

.result-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-label {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
  letter-spacing: 0;
}

.result-value {
  font-size: 16px;
  font-weight: 600;
  padding: 8px 12px;
  background: white;
  border-radius: 10px;
  border: 1px solid rgba(249, 168, 212, 0.2);
}

.game-account {
  color: #ec4899;
}

.system-account {
  color: #8b5cf6;
  background: linear-gradient(to right, #faf5ff, #fff);
  border-color: rgba(139, 92, 246, 0.2);
}

.result-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(248, 161, 209, 0.3), transparent);
  margin: 4px 0;
}

.result-footer {
  padding: 10px 16px;
  background: #f7f7fb;
  border-top: 1px solid rgba(60, 60, 67, 0.08);
}

.result-hint {
  font-size: 12px;
  color: #f472b6;
  line-height: 1.5;
  display: block;
}

.result-link {
  color: #ec4899;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.result-link:hover {
  color: #db2777;
}

/* 警告型结果卡片 */
.result-card-warning {
  border-color: rgba(251, 191, 36, 0.4);
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.result-card-warning .result-header {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.result-card-warning .result-hint {
  color: #d97706;
}

.result-card-warning .result-value {
  border-color: rgba(251, 191, 36, 0.2);
}

/* 错误型结果卡片 */
.result-card-error {
  border-color: rgba(244, 63, 94, 0.3);
  background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
}

.result-card-error .result-header {
  background: linear-gradient(135deg, #fb7185, #f43f5e);
}

.result-card-error .result-hint {
  color: #e11d48;
}

.error-reason {
  color: #be123c;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin: 8px 0;
  padding: 8px;
}

.modal-footer {
  display: flex;
  justify-content: center;
}

.close-btn {
  width: 100%;
  height: 46px;
  background: linear-gradient(135deg, #f472b6, #ec4899);
  color: white;
  border: none;
  border-radius: 13px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
  box-shadow:
    0 8px 18px rgba(236, 72, 153, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.34);
}

.close-btn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 10px 22px rgba(236, 72, 153, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

/* 移动端适配 */
@media (max-width: 780px) {
  .main-card {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
    box-shadow: none;
    background: rgba(255, 255, 255, 0.74);
    /* 修复：让卡片内部也变成垂直居中容器 */
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .login-register-container {
    padding: 0;
    align-items: stretch; /* 让卡片撑满容器 */
  }

  .content-area {
    padding: 24px 20px;
    flex: 1; /* 让内容区域自动撑开垂直空间 */
    display: flex;
    flex-direction: column;
    justify-content: center; /* 内容真正垂直居中 */
  }

  .main-title {
    font-size: 20px;
  }

  .modal-content {
    margin: 20px;
    padding: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .main-card,
  .modal-content,
  .query-result-card,
  .error-message,
  .spinner {
    animation: none;
  }

  .tab-btn,
  .slider,
  .input-wrapper,
  .password-toggle,
  .captcha-btn,
  .forgot-link,
  .submit-btn,
  .close-btn {
    transition: none;
  }
}

/* Secret Garden entry-card visual pass */
.login-register-container {
  --login-brand: #ec4899;
  --login-brand-soft: #f472b6;
  --login-brand-pale: #fdf2f8;
  --login-rose-ink: #7f294e;
  --login-text: #2b1f27;
  --login-muted: #8c6f7d;
  --login-surface: rgba(255, 250, 252, 0.92);
  --login-field: rgba(255, 255, 255, 0.9);
  --login-border: rgba(236, 72, 153, 0.16);
  --login-shadow: 0 22px 60px rgba(190, 95, 132, 0.18);

  min-height: 100dvh;
  background:
    radial-gradient(circle at 18% 16%, rgba(255, 186, 216, 0.5) 0, transparent 32%),
    radial-gradient(circle at 82% 20%, rgba(190, 168, 255, 0.24) 0, transparent 26%),
    radial-gradient(circle at 72% 86%, rgba(255, 224, 191, 0.38) 0, transparent 30%),
    linear-gradient(165deg, #fff8fb 0%, #fdeff5 42%, #f9edf4 72%, #fff9f1 100%);
  padding: max(20px, env(safe-area-inset-top)) 18px max(20px, env(safe-area-inset-bottom));
  overflow-x: hidden;
}

.login-register-container::before {
  content: '';
  display: block;
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(255, 255, 255, 0.38), transparent 34%),
    radial-gradient(circle at center, transparent 0 58%, rgba(255, 255, 255, 0.32) 100%);
}

.background-decorations {
  display: block;
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.float-item,
.leaf {
  display: none;
}

.circle {
  display: block;
  border-radius: 999px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.72), rgba(255, 196, 220, 0.22)),
    rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.62);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.9);
  filter: blur(0.1px);
}

.circle-1 {
  width: 118px;
  height: 118px;
  top: 9%;
  left: -30px;
}

.circle-2 {
  width: 92px;
  height: 92px;
  right: -22px;
  bottom: 13%;
}

.main-card {
  max-width: 420px;
  background:
    linear-gradient(155deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 246, 250, 0.92) 54%, rgba(255, 250, 244, 0.9) 100%),
    var(--login-surface);
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 30px;
  overflow: hidden;
  box-shadow:
    var(--login-shadow),
    0 2px 8px rgba(236, 72, 153, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(18px) saturate(1.08);
  -webkit-backdrop-filter: blur(18px) saturate(1.08);
}

.main-card::before {
  content: '';
  display: block;
  position: absolute;
  inset: 0 0 auto;
  height: 132px;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 0, rgba(255, 212, 229, 0.72), transparent 58%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.72), transparent);
}

.main-card::after {
  content: '';
  position: absolute;
  inset: auto 28px 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.24), transparent);
}

.top-decoration,
.bottom-decoration {
  display: block;
  height: 0;
  background: transparent;
}

.pink-ribbon,
.pink-ribbon-bottom,
.dot,
.cute-footer {
  display: none;
}

.content-area {
  padding: 36px 28px 30px;
}

.title-section {
  margin-bottom: 26px;
}

.title-section::before {
  width: 66px;
  height: 66px;
  margin: 0 auto 18px;
  border-radius: 24px;
  background:
    radial-gradient(circle at 36% 30%, rgba(255, 255, 255, 0.9) 0 10%, transparent 11%),
    radial-gradient(circle at 64% 66%, rgba(255, 255, 255, 0.5) 0 8%, transparent 9%),
    linear-gradient(145deg, #ff8ac2 0%, #ec4899 58%, #c02673 100%);
  box-shadow:
    0 14px 30px rgba(236, 72, 153, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.58),
    inset 0 -10px 18px rgba(126, 34, 88, 0.12);
}

.main-title {
  color: var(--login-text);
  font-size: 25px;
  font-weight: 700;
  line-height: 1.18;
  margin-bottom: 8px;
}

.sub-title {
  color: var(--login-muted);
  font-size: 13px;
  line-height: 1.55;
  max-width: 280px;
  margin: 0 auto;
}

.tabs-section {
  margin-bottom: 24px;
}

.tabs-wrapper {
  height: 46px;
  padding: 4px;
  border-radius: 17px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.42), rgba(255, 226, 239, 0.34)),
    rgba(252, 231, 243, 0.78);
  border: 1px solid rgba(236, 72, 153, 0.13);
  box-shadow: inset 0 1px 2px rgba(126, 34, 88, 0.06);
}

.tab-btn {
  height: 38px;
  border-radius: 13px;
  color: #a56a83;
  font-size: 14px;
  font-weight: 600;
  transition:
    color 0.22s ease,
    opacity 0.22s ease;
}

.tab-btn.active {
  color: var(--login-rose-ink);
}

.slider {
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: 38px;
  border-radius: 13px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 250, 252, 0.9)),
    #fff;
  box-shadow:
    0 7px 18px rgba(190, 95, 132, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.form-section {
  gap: 15px;
}

.input-group {
  gap: 7px;
}

.input-label {
  color: var(--login-rose-ink);
  font-size: 13px;
  font-weight: 650;
  margin-left: 8px;
}

.input-wrapper {
  min-height: 52px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 250, 252, 0.92)),
    var(--login-field);
  border: 1px solid rgba(185, 87, 123, 0.2);
  border-radius: 18px;
  padding: 0 15px;
  box-shadow:
    0 8px 20px rgba(190, 95, 132, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.input-wrapper:focus-within {
  border-color: rgba(236, 72, 153, 0.62);
  box-shadow:
    0 0 0 4px rgba(236, 72, 153, 0.12),
    0 10px 24px rgba(190, 95, 132, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.form-input {
  padding: 14px 0;
  color: var(--login-text);
  font-size: 15px;
}

.form-input::placeholder {
  color: #c19baa;
}

.password-toggle {
  min-width: 38px;
  min-height: 38px;
}

.password-toggle:hover {
  background-color: rgba(236, 72, 153, 0.08);
}

.captcha-btn {
  height: 34px;
  border-radius: 12px;
  background:
    linear-gradient(145deg, #ff80bb, #ec4899 62%, #d5337f),
    var(--login-brand);
  box-shadow: 0 6px 14px rgba(236, 72, 153, 0.18);
}

.options-row {
  margin-top: -1px;
}

.checkbox-group {
  color: var(--login-muted);
  min-height: 32px;
}

.checkmark {
  width: 19px;
  height: 19px;
  border-radius: 7px;
  border-color: rgba(185, 87, 123, 0.28);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.custom-checkbox:checked + .checkmark {
  background:
    linear-gradient(145deg, #ff80bb, #ec4899),
    var(--login-brand);
  border-color: rgba(236, 72, 153, 0.72);
}

.forgot-link,
.link {
  color: var(--login-brand);
}

.forgot-link:hover,
.link:hover {
  color: #be185d;
}

.submit-btn {
  height: 52px;
  margin-top: 8px;
  border-radius: 18px;
  background:
    linear-gradient(145deg, #ff86bf 0%, #ec4899 55%, #cf2f7b 100%),
    var(--login-brand);
  box-shadow:
    0 14px 28px rgba(236, 72, 153, 0.28),
    0 4px 10px rgba(126, 34, 88, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.36);
  font-size: 16px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    0 18px 34px rgba(236, 72, 153, 0.34),
    0 5px 12px rgba(126, 34, 88, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.42);
}

.submit-btn:active:not(:disabled),
.close-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.99);
}

.error-message {
  color: #d92d57;
  padding-left: 8px;
}

.modal-overlay {
  background:
    radial-gradient(circle at 50% 38%, rgba(255, 199, 222, 0.22), transparent 36%),
    rgba(57, 35, 45, 0.42);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.modal-content {
  background:
    linear-gradient(155deg, rgba(255, 255, 255, 0.98), rgba(255, 246, 250, 0.96)),
    #fff;
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 26px;
  box-shadow: 0 24px 70px rgba(57, 35, 45, 0.2);
}

.modal-title {
  color: var(--login-text);
}

.success-message {
  color: var(--login-muted);
}

.account-info,
.query-result-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 250, 252, 0.92)),
    #fff;
  border-color: rgba(185, 87, 123, 0.16);
  box-shadow: 0 8px 20px rgba(190, 95, 132, 0.08);
}

.result-header {
  background: linear-gradient(180deg, #fff3f8, #fde7f1);
}

.result-title {
  color: var(--login-rose-ink);
}

.result-footer {
  background: rgba(253, 242, 248, 0.72);
  border-top-color: rgba(185, 87, 123, 0.14);
}

.close-btn {
  border-radius: 16px;
  background:
    linear-gradient(145deg, #ff86bf, #ec4899 58%, #cf2f7b),
    var(--login-brand);
  box-shadow:
    0 12px 24px rgba(236, 72, 153, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.36);
}

@media (max-width: 780px) {
  .login-register-container {
    align-items: center;
    padding: max(18px, env(safe-area-inset-top)) 16px max(18px, env(safe-area-inset-bottom));
  }

  .main-card {
    max-width: 430px;
    min-height: auto;
    border-radius: 30px;
    box-shadow:
      0 20px 46px rgba(190, 95, 132, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    display: block;
  }

  .content-area {
    padding: 34px 22px 28px;
    display: block;
  }

  .main-title {
    font-size: 24px;
  }
}

@media (max-width: 360px) {
  .content-area {
    padding: 30px 18px 24px;
  }

  .main-title {
    font-size: 22px;
  }

  .tabs-wrapper {
    height: 44px;
  }

  .tab-btn,
  .slider {
    height: 36px;
  }
}

/* Modern clarity pass: remove ambiguous badge and reduce mobile blur */
.login-register-container {
  --login-brand: #ec4899;
  --login-brand-soft: #f56aa9;
  --login-rose-ink: #8f315d;
  --login-text: #241820;
  --login-muted: #8a7480;
  --login-border: rgba(236, 72, 153, 0.14);
  --login-shadow: 0 18px 46px rgba(205, 112, 148, 0.14);

  background:
    radial-gradient(circle at 16% 8%, rgba(255, 205, 225, 0.38) 0, transparent 28%),
    radial-gradient(circle at 86% 18%, rgba(220, 214, 255, 0.2) 0, transparent 24%),
    linear-gradient(160deg, #fff9fb 0%, #fdeff5 48%, #fff8f0 100%);
}

.login-register-container::before {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.44), transparent 46%);
}

.circle {
  background: rgba(255, 255, 255, 0.42);
  border-color: rgba(255, 255, 255, 0.58);
  box-shadow: none;
  filter: none;
}

.main-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(255, 247, 251, 0.95)),
    #fffafd;
  border-color: rgba(255, 255, 255, 0.86);
  box-shadow:
    var(--login-shadow),
    0 1px 0 rgba(255, 255, 255, 0.84) inset;
  backdrop-filter: blur(8px) saturate(1.02);
  -webkit-backdrop-filter: blur(8px) saturate(1.02);
}

.main-card::before {
  height: 96px;
  background: linear-gradient(180deg, rgba(255, 229, 239, 0.5), transparent);
}

.title-section {
  margin-bottom: 24px;
}

.title-section::before {
  display: none;
}

.main-title {
  font-size: 26px;
  color: var(--login-text);
}

.sub-title {
  color: var(--login-muted);
}

.tabs-wrapper {
  background: rgba(253, 242, 248, 0.78);
  border-color: rgba(236, 72, 153, 0.12);
  box-shadow: inset 0 1px 2px rgba(190, 95, 132, 0.04);
}

.slider {
  box-shadow:
    0 4px 12px rgba(190, 95, 132, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);
}

.input-wrapper {
  background: #fff;
  border-color: rgba(185, 87, 123, 0.18);
  box-shadow:
    0 4px 14px rgba(190, 95, 132, 0.055),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);
}

.submit-btn,
.close-btn,
.captcha-btn {
  background: linear-gradient(135deg, #fb6dab 0%, #ec4899 100%);
}

@media (max-width: 780px) {
  .login-register-container {
    background:
      linear-gradient(160deg, #fff8fb 0%, #fdeef5 52%, #fff8f1 100%);
  }

  .login-register-container::before,
  .main-card::before,
  .main-card::after,
  .background-decorations {
    display: none;
  }

  .main-card {
    background: #fffafd;
    border: 1px solid rgba(236, 72, 153, 0.1);
    box-shadow: 0 14px 34px rgba(205, 112, 148, 0.16);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    transform: translateZ(0);
  }

  .content-area {
    padding-top: 32px;
  }

  .title-section {
    margin-bottom: 22px;
  }

  .main-title {
    font-size: 25px;
  }

  .input-wrapper {
    box-shadow: 0 3px 10px rgba(190, 95, 132, 0.06);
  }

  .modal-overlay,
  .modal-content {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

/* Modern checkbox state */
.checkmark {
  background: rgba(255, 255, 255, 0.86);
  border: 1.5px solid rgba(143, 49, 93, 0.22);
  box-shadow: none;
}

.custom-checkbox:checked + .checkmark {
  background: rgba(253, 242, 248, 0.95);
  border-color: rgba(236, 72, 153, 0.52);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.62);
}

.custom-checkbox:checked + .checkmark::after {
  color: var(--login-brand);
  font-size: 12px;
  font-weight: 700;
}

.checkbox-group:active .checkmark {
  background: rgba(253, 242, 248, 0.72);
}

/* Forgot-account iOS sheet */
.forgot-overlay {
  align-items: flex-end;
  padding: 16px;
  background:
    radial-gradient(circle at 50% 100%, rgba(253, 242, 248, 0.22), transparent 32%),
    rgba(35, 28, 33, 0.42);
}

.forgot-sheet {
  width: min(100%, 420px);
  max-width: 420px;
  max-height: min(86dvh, 680px);
  padding: 0;
  border-radius: 28px;
  overflow: hidden;
  text-align: left;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 250, 252, 0.96)),
    #fff;
  border: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow:
    0 24px 70px rgba(35, 28, 33, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.forgot-sheet::before {
  content: '';
  display: block;
  width: 38px;
  height: 5px;
  margin: 10px auto 0;
  border-radius: 999px;
  background: rgba(60, 60, 67, 0.18);
}

.forgot-header {
  margin: 0;
  padding: 22px 24px 8px;
  text-align: left;
}

.forgot-header .modal-title {
  color: #1d1d1f;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.forgot-body {
  margin: 0;
  padding: 0 24px 18px;
  text-align: left;
}

.forgot-description {
  color: rgba(60, 60, 67, 0.68);
  font-size: 14px;
  line-height: 1.55;
  margin: 0 0 18px;
}

.forgot-search-field {
  margin: 0 0 16px;
}

.forgot-search-field .input-wrapper {
  min-height: 54px;
  border-radius: 16px;
  background: rgba(242, 242, 247, 0.74);
  border-color: rgba(60, 60, 67, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.forgot-search-field .input-wrapper:focus-within {
  background: #fff;
  border-color: rgba(236, 72, 153, 0.5);
  box-shadow:
    0 0 0 4px rgba(236, 72, 153, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.forgot-sheet .query-result-card {
  margin: 14px 0 0;
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(60, 60, 67, 0.1);
  box-shadow: 0 10px 28px rgba(35, 28, 33, 0.06);
}

.forgot-sheet .result-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 10px;
  background: #fff;
}

.forgot-sheet .result-icon {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  font-size: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.forgot-sheet .result-icon::before {
  font-size: 15px;
  font-weight: 800;
  line-height: 1;
}

.forgot-sheet .result-title {
  color: #1d1d1f;
  font-size: 16px;
  font-weight: 700;
}

.forgot-sheet .result-body {
  padding: 2px 16px 16px;
  gap: 10px;
}

.forgot-sheet .result-label {
  color: rgba(60, 60, 67, 0.58);
  font-size: 12px;
  font-weight: 600;
}

.forgot-sheet .result-value {
  margin-top: 2px;
  padding: 12px 14px;
  border-radius: 14px;
  color: #1d1d1f;
  background: rgba(242, 242, 247, 0.66);
  border: 1px solid rgba(60, 60, 67, 0.08);
  font-size: 16px;
  font-weight: 700;
  word-break: break-all;
}

.forgot-sheet .result-footer {
  padding: 12px 16px 14px;
  background: rgba(242, 242, 247, 0.48);
  border-top: 1px solid rgba(60, 60, 67, 0.08);
}

.forgot-sheet .result-hint {
  color: rgba(60, 60, 67, 0.66);
  font-size: 12px;
  line-height: 1.55;
}

.forgot-sheet .result-card-success {
  border-color: rgba(52, 199, 89, 0.2);
}

.forgot-sheet .result-card-success .result-icon {
  background: rgba(52, 199, 89, 0.13);
  color: #248a3d;
}

.forgot-sheet .result-card-success .result-icon::before {
  content: '✓';
}

.forgot-sheet .result-card-success .result-value {
  background: rgba(52, 199, 89, 0.08);
  border-color: rgba(52, 199, 89, 0.18);
  color: #1f7a3a;
}

.forgot-sheet .result-card-warning {
  background: #fff;
  border-color: rgba(255, 149, 0, 0.24);
}

.forgot-sheet .result-card-warning .result-header {
  background: #fff;
}

.forgot-sheet .result-card-warning .result-icon {
  background: rgba(255, 149, 0, 0.14);
  color: #b56a00;
}

.forgot-sheet .result-card-warning .result-icon::before {
  content: '!';
}

.forgot-sheet .result-card-warning .result-title {
  color: #1d1d1f;
}

.forgot-sheet .result-card-warning .result-value {
  background: rgba(255, 149, 0, 0.08);
  border-color: rgba(255, 149, 0, 0.18);
  color: #8a5200;
}

.forgot-sheet .result-card-warning .result-hint {
  color: rgba(138, 82, 0, 0.78);
}

.forgot-sheet .result-card-error {
  background: #fff;
  border-color: rgba(255, 59, 48, 0.22);
}

.forgot-sheet .result-card-error .result-header {
  background: #fff;
}

.forgot-sheet .result-card-error .result-icon {
  background: rgba(255, 59, 48, 0.12);
  color: #d70015;
}

.forgot-sheet .result-card-error .result-icon::before {
  content: '×';
}

.forgot-sheet .result-card-error .result-title {
  color: #1d1d1f;
}

.forgot-sheet .error-reason {
  margin: 2px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 59, 48, 0.08);
  color: #c71922;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
}

.forgot-sheet .result-card-error .result-hint {
  color: rgba(199, 25, 34, 0.76);
}

.forgot-sheet .result-link {
  color: var(--login-brand);
  text-decoration: none;
}

.forgot-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 24px 24px;
}

.forgot-actions .close-btn {
  height: 50px;
  border-radius: 16px;
  box-shadow: none;
}

.forgot-actions .close-btn:disabled {
  opacity: 0.55;
}

.forgot-secondary-btn {
  background: rgba(118, 118, 128, 0.12) !important;
  color: #1d1d1f !important;
  box-shadow: none !important;
}

@media (min-width: 781px) {
  .forgot-overlay {
    align-items: center;
  }
}

@media (max-width: 780px) {
  .forgot-overlay {
    padding: 10px;
  }

  .forgot-sheet {
    width: 100%;
    max-height: calc(100dvh - 20px);
    border-radius: 28px 28px 24px 24px;
  }

  .forgot-header {
    padding: 20px 20px 8px;
  }

  .forgot-body {
    padding: 0 20px 16px;
  }

  .forgot-actions {
    padding: 0 20px max(20px, env(safe-area-inset-bottom));
  }
}

/* Account recovery refinement */
.forgot-overlay {
  background: rgba(22, 20, 24, 0.46);
}

.forgot-sheet {
  background: #f7f7f9;
  border-color: rgba(255, 255, 255, 0.7);
}

.forgot-header {
  padding-bottom: 6px;
}

.forgot-header .modal-title {
  letter-spacing: 0;
}

.forgot-description {
  max-width: 320px;
}

.forgot-input-label {
  color: rgba(60, 60, 67, 0.62);
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 2px 2px;
}

.forgot-search-field .input-wrapper {
  background: #fff;
  border-color: rgba(60, 60, 67, 0.08);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.88) inset,
    0 1px 2px rgba(60, 60, 67, 0.04);
}

.forgot-search-field .form-input {
  font-size: 16px;
}

.forgot-sheet .query-result-card {
  background: #fff;
  border-radius: 18px;
  border-color: rgba(60, 60, 67, 0.08);
  box-shadow: none;
}

.forgot-sheet .result-header {
  padding: 15px 16px 9px;
}

.forgot-sheet .result-icon {
  width: 26px;
  height: 26px;
}

.forgot-sheet .result-title {
  font-size: 15px;
}

.forgot-sheet .result-body {
  padding-bottom: 14px;
}

.forgot-sheet .result-value {
  background: #f5f5f7;
  border: none;
  font-size: 15px;
}

.forgot-sheet .result-footer {
  background: #f5f5f7;
}

.forgot-actions .close-btn {
  font-size: 16px;
  font-weight: 650;
}

.forgot-secondary-btn {
  background: #fff !important;
  color: rgba(60, 60, 67, 0.86) !important;
  border: 1px solid rgba(60, 60, 67, 0.08) !important;
}

@keyframes forgot-sheet-up {
  from {
    transform: translateY(100%);
    opacity: 0.92;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 780px) {
  .forgot-overlay {
    display: block;
    padding: 0;
    overflow: hidden;
  }

  .forgot-sheet {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: none;
    max-height: calc(100dvh - max(12px, env(safe-area-inset-top)));
    margin: 0;
    border-width: 1px 0 0;
    border-radius: 28px 28px 0 0;
    animation: forgot-sheet-up 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .forgot-sheet::before {
    margin-top: 9px;
  }
}

/* Forgot account content inside shared ModernSheet */
.forgot-sheet-content {
  padding: 0 20px;
}

.forgot-sheet-content .forgot-body {
  padding: 0;
}

.forgot-sheet-content .forgot-description {
  margin: 0 0 18px;
}

.forgot-sheet-content .forgot-actions {
  padding: 0;
}

.forgot-sheet-content .forgot-search-field {
  margin-bottom: 16px;
}

.forgot-sheet-content .query-result-card {
  margin-top: 14px;
}

.forgot-sheet-content .close-btn {
  width: 100%;
}
</style>
