<template>
  <!-- 兑换码弹窗 -->
  <van-popup
    v-model:show="showExchangeModal"
    round="24px"
    position="center"
    :style="{ width: '90%', maxWidth: '420px', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)' }"
    closeable
    close-icon-position="top-right"
    @close="onModalClose"
    class="exchange-popup"
  >
    <!-- 弹窗内容区 -->
    <div class="exchange-modal">
      <!-- 顶部装饰 + 标题 -->
      <div class="modal-header">
        <div class="decor-line"></div>
        <div class="title-wrap">
          <div class="modal-title">礼品码兑换</div>
          <div class="modal-subtitle">REDEEM GIFT CODE</div>
        </div>
      </div>

      <!-- 表单区域 - 卡片式设计 -->
      <div class="form-card">
        <!-- openId输入框 -->
        <van-field
          v-model="openId"
          placeholder="请输入用户ID"
          class="form-field openid-input"
          clearable
          @input="handleOpenIdInput"
          @blur="getUserNameByOpenId"
          border="none"
        >
          <template #left-icon>
            <van-icon name="user-o" class="field-icon" />
          </template>
          <template #right-icon>
            <van-loading v-if="isGettingName" size="14px" color="#7b61ff" />
          </template>
        </van-field>

        <!-- 用户名显示栏 -->
        <div class="username-display" v-if="userName || (openId && userName === '用户不存在！')">
          <span class="name-text" :class="{ 'name-error': userName == '用户不存在！' }">
            {{ userName }}
          </span>
        </div>

        <!-- 分割线 -->
        <div class="field-divider"></div>

        <!-- 兑换码输入框 -->
        <van-field
          v-model="cdKey"
          placeholder="XXXX-XXXX-XXXX-XXXX"
          class="form-field cdkey-input"
          :rules="[{ validator: validateCdkey, message: '礼品码格式不正确' }]"
          clearable
          @input="handleCdkeyInput"
          border="none"
        >
          <template #left-icon>
            <van-icon name="coupon-o" class="field-icon" />
          </template>
        </van-field>
      </div>

      <!-- 兑换按钮 - 渐变风格 -->
      <van-button
        type="primary"
        class="exchange-btn"
        :loading="isLoading"
        :disabled="!canExchange"
        @click="handleExchange"
        block
      >
        立即兑换
      </van-button>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, watch, defineProps } from 'vue'
import { showToast } from 'vant'
import request from '@/utils/request'

// 1. 定义props接收外部传入的默认openId
const props = defineProps({
  defaultOpenId: {
    type: String,
    default: '', // 默认值为空
  },
})

const emit = defineEmits(['exchange-success'])

// 弹窗显示状态
const showExchangeModal = ref(false)
// 兑换码
const cdKey = ref('')
// 加载状态
const isLoading = ref(false)
// 新增：openId相关
const openId = ref('')
const userName = ref('')
const isGettingName = ref(false) // 获取用户名的加载状态

// 2. 监听defaultOpenId变化，同步到openId
watch(
  () => props.defaultOpenId,
  (newVal) => {
    if (newVal && showExchangeModal.value) {
      openId.value = newVal
      // 如果传入了默认openId，自动获取用户名
      getUserNameByOpenId()
    }
  },
  { immediate: true }, // 初始化时立即执行
)

// 新增：计算是否可兑换（用户名存在 + 兑换码格式正确）
const canExchange = computed(() => {
  return !!userName.value && userName.value !== '用户不存在！' && validateCdkey(cdKey.value)
})

// 打开弹窗
const openModal = () => {
  showExchangeModal.value = true
  // 打开时清空所有输入和状态，保留默认openId
  cdKey.value = ''
  userName.value = ''
  // 如果有默认openId，赋值并自动获取用户名
  if (props.defaultOpenId) {
    openId.value = props.defaultOpenId
    getUserNameByOpenId()
  }
}

// 关闭弹窗
const onModalClose = () => {
  showExchangeModal.value = false
  // 关闭时重置所有状态
  isLoading.value = false
  isGettingName.value = false
}

// 处理openId输入（可选：限制输入内容，比如只允许字母数字）
const handleOpenIdInput = (value) => {
  // 清空用户名（输入新的openId时重置）
  userName.value = ''
  // 可选：过滤非法字符，根据你的openId规则调整
  const filteredValue = value.replace(/[^a-zA-Z0-9_-]/g, '')
  openId.value = filteredValue
}

// 新增：根据openId获取用户名
const getUserNameByOpenId = async () => {
  // 空值不调用接口
  if (!openId.value) {
    userName.value = ''
    return
  }
  try {
    isGettingName.value = true
    const res = await request({
      url: 'api/getNameByOpenId', // 替换为实际接口地址
      method: 'GET', // 根据实际接口调整请求方式
      params: { openId: openId.value }, // GET用params，POST用data
    })

    // 根据接口返回格式调整，示例：res.code=200时返回name
    if (res.code === 200 && res.data) {
      userName.value = res.data
      showToast('用户信息获取成功')
    } else {
      userName.value = '用户不存在！'
    }
  } catch (error) {
    userName.value = ''
    showToast('用户信息获取失败，请重试')
    console.error('获取用户名失败：', error)
  } finally {
    isGettingName.value = false
  }
}

// 处理兑换码输入（限制输入内容）
const handleCdkeyInput = (value) => {
  // 只允许字母、数字和短横线，且长度不超过 19（XXXX-XXXX-XXXX-XXXX 共19位）
  const filteredValue = value
    .replace(/[^a-zA-Z0-9-]/g, '') // 过滤非法字符
    .slice(0, 19) // 限制最大长度

  // 自动补全短横线（可选优化，提升用户体验）
  let formattedValue = ''
  const pureValue = filteredValue.replace(/-/g, '') // 去掉所有短横线
  for (let i = 0; i < pureValue.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedValue += '-'
    }
    formattedValue += pureValue[i]
  }

  cdKey.value = formattedValue
}

// 校验兑换码格式
const validateCdkey = (val) => {
  // 正则匹配 XXXX-XXXX-XXXX-XXXX 格式（字母数字组合）
  const reg = /^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$/
  return reg.test(val)
}

// 兑换按钮点击事件
const handleExchange = async () => {
  // 双重校验（防止意外）
  if (!canExchange.value) {
    showToast('请确认OpenID对应的用户存在且兑换码格式正确')
    return
  }

  // 调用接口
  try {
    isLoading.value = true
    const res = await request({
      url: '/api/useCdKey',
      method: 'GET',
      params: {
        cdKey: cdKey.value,
        openId: openId.value, // 新增：传递openId到后端
      },
    })

    // 处理接口返回结果
    if (res.code === 200) {
      showToast('兑换成功！请刷新页面进行查看。')
      showExchangeModal.value = false // 兑换成功关闭弹窗
      emit('exchange-success')
    } else {
      showToast(res.remark)
    }
  } catch (error) {
    showToast('网络异常，请稍后再试')
    console.error('兑换接口调用失败：', error)
  } finally {
    isLoading.value = false
  }
}

// 暴露组件方法（供父组件调用）
defineExpose({
  openModal,
})
</script>

<style scoped>
/* 弹窗基础样式 */
.exchange-popup {
  --van-popup-background: #ffffff;
  --van-popup-close-icon-color: #c0c4cc;
}

.exchange-modal {
  padding: 36px 24px 28px;
  position: relative;
}

/* 头部区域 - 极简轻奢风格 */
.modal-header {
  text-align: center;
  margin-bottom: 32px;
  position: relative;
}

.decor-line {
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e5e9f2, transparent);
  z-index: 1;
}

.title-wrap {
  position: relative;
  z-index: 2;
  display: inline-block;
  background: #fff;
  padding: 0 20px;
}

.modal-title {
  font-size: 22px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.modal-subtitle {
  font-size: 10px;
  color: #9da3af;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* 购买引导 - 轻量设计 */
.buy-guide {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background-color: #f9fafc;
  border-radius: 16px;
  margin-bottom: 24px;
}

.guide-icon {
  color: #7b61ff;
  font-size: 16px;
  margin-right: 8px;
}

.guide-text {
  font-size: 13px;
  color: #606266;
}

.buy-link {
  color: #7b61ff;
  font-weight: 500;
  text-decoration: none;
  position: relative;
}

.buy-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: #7b61ff;
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

.buy-link:hover::after {
  transform: scaleX(1);
}

/* 表单卡片 - 悬浮效果 */
.form-card {
  background: #f9fafc;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

/* 通用表单字段 */
.form-field {
  --van-field-padding: 12px 0;
  --van-field-placeholder-color: #c0c4cc;
  --van-field-input-color: #303133;
  --van-field-input-font-size: 15px;
  margin-bottom: 0;
}

.field-icon {
  color: #9da3af;
  margin-right: 8px;
  font-size: 16px;
}

/* 用户名显示区 */
.username-display {
  padding: 8px 0;
  margin-left: 24px;
}

.name-text {
  font-size: 12px;
  color: #606266;
}

.name-error {
  color: #f56c6c;
  font-weight: 500;
}

/* 字段分割线 */
.field-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e5e9f2, transparent);
  margin: 8px 0;
}

/* 兑换按钮 - 渐变高级样式 */
.exchange-btn {
  height: 52px;
  border-radius: 26px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #7b61ff, #5742d8) !important;
  border: none !important;
  box-shadow: 0 8px 16px rgba(123, 97, 255, 0.25);
  transition: all 0.2s ease;
}

.exchange-btn:not(:disabled):active {
  transform: translateY(1px);
  box-shadow: 0 4px 8px rgba(123, 97, 255, 0.2);
}

.exchange-btn:deep(.van-button--disabled) {
  background: #e5e9f2 !important;
  color: #c0c4cc !important;
  box-shadow: none !important;
}

/* 关闭按钮样式优化 */
:deep(.van-popup__close-icon) {
  font-size: 20px;
  top: 20px;
  right: 20px;
  transition: color 0.2s;
}

:deep(.van-popup__close-icon):hover {
  color: #9da3af;
}

/* 输入框清除按钮样式 */
:deep(.van-field__clear-icon) {
  color: #c0c4cc;
  width: 16px;
  height: 16px;
}

/* 响应式适配 */
@media (max-width: 375px) {
  .exchange-modal {
    padding: 28px 16px 24px;
  }

  .modal-title {
    font-size: 20px;
  }

  .exchange-btn {
    height: 48px;
  }
}
</style>
