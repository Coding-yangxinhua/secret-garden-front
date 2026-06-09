<template>
  <!-- 🍎 兑换码兑换 – 粉调磨砂玻璃 iOS 风格 Sheet -->
  <ModernSheet v-model="showSheet" title="礼品码兑换">
    <div class="ec-content">
      <!-- Hero 区域 -->
      <div class="ec-hero">
        <div class="ec-hero-icon">
          <van-icon name="coupon-o" size="28" color="#ff6767" />
        </div>
        <p class="ec-hero-desc">输入兑换码领取奖励</p>
      </div>

      <!-- 表单分组：用户ID -->
      <div class="ec-group">
        <div class="ec-row">
          <span class="ec-row-label">用户ID</span>
          <van-field
            v-model="openId"
            placeholder="请输入用户ID"
            class="ec-field"
            clearable
            :border="false"
            @input="handleOpenIdInput"
            @blur="getUserNameByOpenId"
          >
            <template #right-icon>
              <van-loading v-if="isGettingName" size="14px" color="#ff6767" />
            </template>
          </van-field>
        </div>
        <div class="ec-divider"></div>
        <div class="ec-row">
          <span class="ec-row-label">兑换码</span>
          <van-field
            v-model="cdKey"
            placeholder="XXXX-XXXX-XXXX-XXXX"
            class="ec-field"
            clearable
            :border="false"
            @input="handleCdkeyInput"
          />
        </div>
      </div>

      <!-- 用户名反馈 -->
      <div class="ec-user-feedback" v-if="userName !== '' && openId !== ''">
        <van-icon
          :name="userName !== '用户不存在！' ? 'success' : 'cross'"
          :color="userName !== '用户不存在！' ? '#ff6767' : '#ff3b30'"
          size="14"
        />
        <span :class="{ 'ec-user-error': userName === '用户不存在！' }">
          {{ userName }}
        </span>
      </div>

      <!-- 兑换按钮 -->
      <button
        class="ec-btn ec-btn-primary"
        :disabled="!canExchange || isLoading"
        @click="handleExchange"
      >
        <span v-if="isLoading" class="ec-spinner"></span>
        <span v-else>立即兑换</span>
      </button>
      <button class="ec-btn ec-btn-ghost" @click="showSheet = false">取消</button>
    </div>

    <div class="modern-sheet-safe-bottom"></div>
  </ModernSheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import ModernSheet from './ModernSheet.vue'
import request from '@/utils/request'

const props = defineProps({
  defaultOpenId: { type: String, default: '' },
})
const emit = defineEmits(['exchange-success'])

const showSheet = ref(false)
const cdKey = ref('')
const isLoading = ref(false)
const openId = ref('')
const userName = ref('')
const isGettingName = ref(false)

watch(
  () => props.defaultOpenId,
  (newVal) => {
    if (newVal && showSheet.value) {
      openId.value = newVal
      getUserNameByOpenId()
    }
  },
  { immediate: true },
)

const canExchange = computed(() => {
  return !!userName.value && userName.value !== '用户不存在！' && validateCdkey(cdKey.value)
})

const openSheet = () => {
  showSheet.value = true
  cdKey.value = ''
  userName.value = ''
  if (props.defaultOpenId) {
    openId.value = props.defaultOpenId
    getUserNameByOpenId()
  }
}

const handleOpenIdInput = (value) => {
  userName.value = ''
  const filteredValue = value.replace(/[^a-zA-Z0-9_-]/g, '')
  openId.value = filteredValue
}

const getUserNameByOpenId = async () => {
  if (!openId.value) {
    userName.value = ''
    return
  }
  try {
    isGettingName.value = true
    const res = await request({
      url: 'api/getNameByOpenId',
      method: 'GET',
      params: { openId: openId.value },
    })
    if (res.code === 200 && res.data) {
      userName.value = res.data
    } else {
      userName.value = '用户不存在！'
    }
  } catch (error) {
    userName.value = ''
    showToast('用户信息获取失败，请重试')
  } finally {
    isGettingName.value = false
  }
}

const handleCdkeyInput = (value) => {
  const filteredValue = value.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 19)
  let formattedValue = ''
  const pureValue = filteredValue.replace(/-/g, '')
  for (let i = 0; i < pureValue.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedValue += '-'
    }
    formattedValue += pureValue[i]
  }
  cdKey.value = formattedValue
}

const validateCdkey = (val) => {
  const reg = /^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$/
  return reg.test(val)
}

const handleExchange = async () => {
  if (!canExchange.value) {
    showToast('请确认用户存在且兑换码格式正确')
    return
  }
  try {
    isLoading.value = true
    const res = await request({
      url: '/api/useCdKey',
      method: 'GET',
      params: { cdKey: cdKey.value, openId: openId.value },
    })
    if (res.code === 200) {
      showToast('兑换成功！请刷新页面进行查看。')
      showSheet.value = false
      emit('exchange-success')
    } else {
      showToast(res.remark)
    }
  } catch (error) {
    showToast('网络异常，请稍后再试')
  } finally {
    isLoading.value = false
  }
}

defineExpose({ openSheet })
</script>

<style scoped>
.ec-content {
  padding: 4px 16px 12px;
}

/* ---- Hero ---- */
.ec-hero {
  text-align: center;
  padding: 12px 0 20px;
}
.ec-hero-icon {
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: rgba(255, 103, 103, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}
.ec-hero-desc {
  font-size: 13px;
  color: #8e8e93;
  margin: 0;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}

/* ---- 磨砂玻璃分组 ---- */
.ec-group {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
}

.ec-row {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 4px 16px;
  gap: 12px;
}
.ec-row + .ec-row {
  border-top: 0.5px solid rgba(60, 60, 67, 0.06);
}

.ec-row-label {
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  width: 60px;
  flex-shrink: 0;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}

.ec-field {
  --van-field-padding: 4px 0 4px 8px;
  --van-field-input-font-size: 16px;
  --van-field-placeholder-color: #c7c7cc;
  --van-field-input-color: #1d1d1f;
  --van-field-input-text-align: right;
  --van-field-clear-icon-color: #c7c7cc;
  --van-field-clear-icon-size: 14px;
  background: transparent;
  flex: 1;
}

.ec-divider {
  height: 0.5px;
  background: rgba(60, 60, 67, 0.06);
  margin-left: 72px;
}

/* ---- 用户反馈 ---- */
.ec-user-feedback {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 13px;
  color: #1d1d1f;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}
.ec-user-error {
  color: #ff3b30;
  font-weight: 500;
}

/* ---- 按钮系统 ---- */
.ec-btn {
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
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
  margin-top: 12px;
}
.ec-btn:active { opacity: 0.75; transform: scale(0.98); }
.ec-btn:disabled { background: #e0e0e0; color: #fff; cursor: not-allowed; transform: none; opacity: 1; box-shadow: none; }

.ec-btn-primary {
  background: linear-gradient(135deg, #ff6767 0%, #ff8a8a 100%);
  color: #fff;
  box-shadow: 0 4px 14px rgba(255, 103, 103, 0.25);
}

.ec-btn-ghost {
  background: transparent;
  color: #ff6767;
  border: 1px solid rgba(255, 103, 103, 0.15);
}
.ec-btn-ghost:active { background: rgba(255, 103, 103, 0.04); }

/* ---- 加载圈 ---- */
.ec-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ec-spin 0.6s linear infinite;
}
@keyframes ec-spin { to { transform: rotate(360deg); } }

.modern-sheet-safe-bottom {
  height: env(safe-area-inset-bottom, 12px);
}

/* ---- 暗色模式 ---- */
@media (prefers-color-scheme: dark) {
  .ec-group {
    background: rgba(30, 30, 35, 0.72);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    border-color: rgba(255, 255, 255, 0.08);
  }
  .ec-row + .ec-row,
  .ec-divider { border-top-color: rgba(255, 255, 255, 0.06); }
  .ec-row-label { color: #f2f2f7; }
  .ec-field {
    --van-field-input-color: #f2f2f7;
    --van-field-placeholder-color: #636366;
  }
  .ec-btn-primary {
    background: linear-gradient(135deg, #ff6767 0%, #e85a5a 100%);
    box-shadow: 0 4px 14px rgba(255, 103, 103, 0.15);
  }
}
</style>
