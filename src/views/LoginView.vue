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

    <!-- 注册成功提示弹窗 -->
    <div v-if="showRegistrationSuccess" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">🎉 注册成功啦 🎉</h2>
        </div>
        <div class="modal-body">
          <p class="success-message">您的账户已成功注册，请妥善保存以下信息：</p>
          <div class="account-info">
            <p><strong>账号：</strong>{{ registrationResult.username }}</p>
            <p><strong>密码：</strong>{{ registrationResult.password }}</p>
          </div>
          <p class="warning-message">💡 请截图保存以上账号密码，后续登录需要使用！</p>
        </div>
        <div class="modal-footer">
          <button class="close-btn" @click="closeSuccessModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { showNotify, showDialog } from 'vant'
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { userLogin, userReg } from '@/utils/userRequest'
import CuteIcon from '@/components/CuteIcon.vue'

const userStore = useUserStore()
const router = useRouter()

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

      // 跳转到主页
      router.push({ name: 'home' })
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

// 忘记密码处理
const handleForgotPassword = () => {
  showDialog({
    message: '联系小助手找回密码哦',
  }).then(() => {
    // on close
  })
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
  background: linear-gradient(
    135deg,
    #fdf2f8 0%,
    #fef7ff 25%,
    #f8faff 50%,
    #f0f9ff 75%,
    #e0f7fa 100%
  );
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
  overflow: hidden;
}

/* 可爱浮动装饰 */
.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.float-item {
  position: absolute;
  font-size: 22px;
  opacity: 0.8;
  animation: cute-float 4s ease-in-out infinite;
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
  background: rgba(248, 161, 209, 0.2);
  animation: float 6s ease-in-out infinite;
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
  animation: float-pulse 3s ease-in-out infinite;
  opacity: 0.7;
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
  max-width: 420px;
  background: linear-gradient(135deg, #ffffff 0%, #fef7ff 50%, #fdf2f8 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 28px;
  border: 1px solid rgba(248, 161, 209, 0.2);
  overflow: hidden;
  position: relative;
  box-shadow:
    0 15px 35px rgba(248, 161, 209, 0.15),
    0 0 40px rgba(251, 207, 232, 0.2);
  z-index: 2;
  animation: card-pop 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

@keyframes card-pop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 顶部可爱装饰条 */
.top-decoration {
  height: 12px;
  background: linear-gradient(90deg, #f8a1d1, #f9a8d4, #f472b6, #ec4899);
  position: relative;
  border-radius: 28px 28px 0 0;
}

.pink-ribbon {
  height: 3px;
  background: linear-gradient(90deg, #f9a8d4, #f472b6, #ec4899, #f8a1d1);
  border-radius: 2px;
  margin: 4px auto;
  width: 80%;
}

.dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #ec4899;
  border-radius: 50%;
  top: -3px;
}

.dot-1 {
  left: 25%;
}
.dot-2 {
  right: 25%;
}

/* 底部可爱装饰 */
.bottom-decoration {
  height: 10px;
  background: linear-gradient(90deg, #f9a8d4, #f472b6, #ec4899, #f8a1d1);
  position: relative;
  border-radius: 0 0 28px 28px;
}

.pink-ribbon-bottom {
  height: 2px;
  background: linear-gradient(90deg, #f9a8d4, #f472b6, #ec4899);
  border-radius: 2px;
  margin: 3px auto;
  width: 80%;
}

.cute-footer {
  position: absolute;
  font-size: 18px;
  top: -9px;
  left: 50%;
  transform: translateX(-50%);
  animation: heartbeat 1.2s ease-in-out infinite;
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
  padding: 28px 32px;
}

/* 标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 26px;
}

.main-title {
  color: #ec4899;
  font-size: 21px;
  font-weight: 600;
  margin: 0 0 6px 0;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(236, 72, 153, 0.1);
}

.sub-title {
  color: #f472b6;
  font-size: 13px;
  margin: 0;
  opacity: 0.9;
}

/* 切换选项卡 */
.tabs-section {
  margin-bottom: 28px;
}

.tabs-wrapper {
  position: relative;
  display: flex;
  background: #fdf2f8;
  border-radius: 20px;
  padding: 5px;
  height: 53px;
  border: 1px solid rgba(249, 168, 212, 0.4);
}

.tab-btn {
  flex: 1;
  height: 42px;
  border: none;
  background: transparent;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 500;
  color: #f9a8d4;
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.tab-btn.active {
  color: white;
  font-weight: 600;
}

.slider {
  position: absolute;
  top: 5px;
  left: 5px;
  width: calc(50% - 6px);
  height: 42px;
  background: linear-gradient(135deg, #f472b6, #ec4899);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.25);
}

.slider.slide-right {
  transform: translateX(100%);
}

/* 表单区域 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  color: #ec4899;
  font-size: 13px;
  font-weight: 500;
  margin-left: 6px;
}

/* 可爱输入框 */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(to right, #ffffff, #fef7ff);
  border: 1.5px solid rgba(249, 168, 212, 0.4);
  border-radius: 18px;
  padding: 0 16px;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #f472b6;
  box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.1);
  transform: translateY(-1px);
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
  padding: 12px 0;
  font-size: 15px;
  background: transparent;
  outline: none;
  color: #555;
}

.form-input::placeholder {
  color: #f9a8d4;
  opacity: 0.7;
}

.password-toggle {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  background-color: #fdf2f8;
  transform: scale(1.05);
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
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
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
  color: #f472b6;
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
  border: 1.5px solid rgba(249, 168, 212, 0.5);
  border-radius: 6px;
  margin-right: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-checkbox:checked + .checkmark {
  background-color: #ec4899;
  border-color: #ec4899;
  transform: scale(1.05);
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
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.forgot-link:hover {
  color: #db2777;
  background-color: #fdf2f8;
  transform: translateY(-1px);
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
  border-radius: 18px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.25);
  letter-spacing: 0.5px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 18px rgba(236, 72, 153, 0.35);
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
  background: white;
  border-radius: 22px;
  padding: 32px;
  max-width: 380px;
  width: 90%;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  animation: modal-pop 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  border: 1px solid rgba(248, 161, 209, 0.2);
}

@keyframes modal-pop {
  0% {
    transform: scale(0.7);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 20px;
}

.modal-title {
  color: #ec4899;
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.modal-body {
  text-align: center;
  margin-bottom: 25px;
}

.success-message {
  color: #f472b6;
  font-size: 16px;
  margin: 0 0 15px 0;
}

.account-info {
  background-color: #fef7ff;
  border: 1px solid rgba(249, 168, 212, 0.3);
  border-radius: 16px;
  padding: 18px;
  margin: 15px 0;
  text-align: left;
}

.account-info p {
  margin: 8px 0;
  color: #555;
  font-size: 15px;
}

.warning-message {
  color: #f43f5e;
  font-size: 14px;
  font-weight: 500;
  margin: 15px 0 0 0;
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
  border-radius: 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.2);
}

.close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(236, 72, 153, 0.3);
}

/* 移动端适配 */
@media (max-width: 780px) {
  .main-card {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
    box-shadow: none;
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
    padding: 25px;
  }
}
</style>
