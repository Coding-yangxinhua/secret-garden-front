<template>
  <div class="group-bind-card">
    <!-- 状态一：未绑定 -->
    <template v-if="!isBound">
      <div class="page-header">
        <div class="header-icon">🎁</div>
        <h2 class="main-title">进群有礼</h2>
        <p class="sub-title">绑定群号赠送1天会员时长</p>
      </div>

      <div class="input-card">
        <div class="input-wrapper">
          <van-field
            v-model="groupName"
            placeholder="输入你的群号"
            class="group-input"
            clearable
            :border="false"
            :disabled="isBinding"
          >
            <template #left-icon>
              <van-icon name="chat-o" class="field-icon" />
            </template>
          </van-field>
        </div>

        <van-button
          type="primary"
          class="bind-btn"
          :loading="isBinding"
          :disabled="!groupName.trim()"
          @click="handleBind"
          block
          round
        >
          绑定并领取时长
        </van-button>

        <div class="exchange-link" @click="handleGoExchange">已有卡密？去兑换</div>
      </div>

      <!-- 绑定成功后的购买链接展示 -->
      <transition name="slide-fade">
        <div v-if="purchaseLink" class="purchase-section">
          <div class="success-tip">✅ 绑定成功，1天时长已到账</div>
          <div class="purchase-card">
            <div class="purchase-label">你的专属购买链接为：</div>
            <div class="purchase-link-text">{{ purchaseLink }}</div>
            <van-button type="primary" class="jump-btn" round block @click="handleJumpToBuy">
              点击跳转
            </van-button>
          </div>
        </div>
      </transition>
    </template>

    <!-- 状态二：已绑定 -->
    <template v-else>
      <div class="page-header">
        <div class="header-icon bound-icon">✅</div>
        <h2 class="main-title bound-title">你已绑定过群，直接购买即可</h2>
      </div>

      <div class="purchase-card">
        <div class="purchase-label">你的专属购买链接为：</div>
        <div class="purchase-link-text">{{ purchaseLink || '正在获取...' }}</div>
        <van-button
          type="primary"
          class="jump-btn"
          round
          block
          :loading="isFetchingLink"
          :disabled="!purchaseLink"
          @click="handleJumpToBuy"
        >
          点击跳转
        </van-button>
      </div>

      <div class="exchange-link" @click="handleGoExchange">已有卡密？去兑换</div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { showNotify, showToast } from 'vant'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'
import router from '@/router'

const emit = defineEmits(['goExchange'])

const userStore = useUserStore()
const systemUser = storeToRefs(userStore).userInfo

const groupName = ref('')
const isBinding = ref(false)
const isFetchingLink = ref(false)
const purchaseLink = ref('')
const boundGroupName = ref('')

// 判断是否已绑定：systemUser.groupName 有值
const isBound = computed(() => {
  return !!(systemUser.value?.groupName || boundGroupName.value)
})

// 获取已绑定用户的购买链接
const fetchPurchaseLinkForBound = async () => {
  if (!systemUser.value) return
  const existingGroupName = systemUser.value.groupName
  if (!existingGroupName) return

  isFetchingLink.value = true
  try {
    const res = await request({
      url: '/user/groupLink',
      method: 'GET'
    })
    if (res.code === 200) {
      purchaseLink.value = res.data.purchaseLink
    } else {
      // 如果出错，尝试手动构建或显示错误
      showNotify(res.remark || '获取购买链接失败')
    }
  } catch (e) {
    showNotify('网络异常，请稍后再试')
  } finally {
    isFetchingLink.value = false
  }
}

// 绑定群号
const handleBind = async () => {
  if (!groupName.value.trim()) return
  if (!systemUser.value) {
    router.push({ name: 'login' })
    return
  }

  isBinding.value = true
  try {
    const res = await request({
      url: '/user/bindGroup',
      method: 'POST',
      params: { groupName: groupName.value.trim() },
    })
    if (res.code === 200) {
      // 绑定成功，更新用户信息中的 groupName
      userStore.updateUserInfo({ groupName: groupName.value.trim() })
      boundGroupName.value = groupName.value.trim()
      purchaseLink.value = res.data.purchaseLink
      showNotify({ type: 'success', message: '绑定成功，1天时长已到账' })
    } else {
      // 处理业务错误
      if (res.remark && res.remark.includes('已绑定')) {
        // 已绑定过群，切换为已绑定状态
        userStore.updateUserInfo({ groupName: groupName.value.trim() })
        boundGroupName.value = groupName.value.trim()
        // 尝试获取购买链接
        fetchPurchaseLinkForBound()
        showNotify({ type: 'warning', message: '你已绑定过该群' })
      } else {
        // 无效群号等错误
        showNotify(res.remark || '群号有误，请确认后重新输入')
      }
    }
  } catch (e) {
    // 处理 HTTP 异常
    showNotify('网络异常，请稍后再试')
  } finally {
    isBinding.value = false
  }
}

// 跳转到购买链接
const handleJumpToBuy = () => {
  if (purchaseLink.value) {
    window.location.href = purchaseLink.value
  }
}

// 跳转到兑换
const handleGoExchange = () => {
  emit('goExchange')
}

onMounted(() => {
  // 如果已绑定，获取购买链接
  if (systemUser.value?.groupName) {
    fetchPurchaseLinkForBound()
  }
})

defineExpose({
  fetchPurchaseLinkForBound,
})
</script>

<style scoped>
.group-bind-card {
  padding: 12px 14px;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 20px;
  padding-top: 4px;
}

.header-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.main-title {
  font-size: 17px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 4px 0;
}

.sub-title {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.bound-icon {
  font-size: 32px;
}

.bound-title {
  font-size: 15px;
  color: #52c41a;
  font-weight: 500;
}

/* 输入卡片 */
.input-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;
}

.input-wrapper {
  background: #f7f8fa;
  border-radius: 10px;
  margin-bottom: 14px;
  overflow: hidden;
}

.group-input {
  --van-field-padding: 10px 14px;
  --van-field-input-font-size: 13px;
  --van-field-placeholder-color: #c0c4cc;
  --van-field-input-color: #303133;
  background: transparent;
}

.field-icon {
  color: #909399;
  font-size: 15px;
  margin-right: 2px;
}

/* 绑定按钮 */
.bind-btn {
  height: 42px;
  font-size: 14px;
  font-weight: 500;
  background: linear-gradient(135deg, #ff6767, #ff8c8c) !important;
  border: none !important;
  box-shadow: 0 3px 10px rgba(255, 103, 103, 0.25);
  letter-spacing: 0.5px;
}

.bind-btn:disabled {
  background: linear-gradient(135deg, #e0e0e0, #eeeeee) !important;
  box-shadow: none !important;
}

/* 兑换链接 */
.exchange-link {
  text-align: center;
  margin-top: 12px;
  font-size: 12px;
  color: #1890ff;
  cursor: pointer;
  padding: 6px 0;
}

.exchange-link:hover {
  color: #096dd9;
  text-decoration: underline;
}

/* 购买卡片 */
.purchase-section {
  animation: fadeInUp 0.4s ease;
}

.purchase-card {
  background: linear-gradient(135deg, #fff8f0, #fff3e0);
  border: 1px solid #ffe0b2;
  border-radius: 12px;
  padding: 14px 14px;
  margin-bottom: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.success-tip {
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: #52c41a;
  margin-bottom: 12px;
  padding: 8px;
  background: #f6ffed;
  border-radius: 8px;
  border: 1px solid #b7eb8f;
}

.purchase-label {
  font-size: 12px;
  color: #606266;
  margin-bottom: 6px;
}

.purchase-link-text {
  font-size: 12px;
  color: #1890ff;
  word-break: break-all;
  background: #f0f5ff;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.jump-btn {
  height: 38px;
  font-size: 13px;
  font-weight: 500;
  background: linear-gradient(135deg, #1890ff, #40a9ff) !important;
  border: none !important;
  box-shadow: 0 3px 10px rgba(24, 144, 255, 0.25);
  letter-spacing: 0.5px;
}

.jump-btn:disabled {
  background: linear-gradient(135deg, #e0e0e0, #eeeeee) !important;
  box-shadow: none !important;
}

/* 过渡动画 */
.slide-fade-enter-active {
  transition: all 0.4s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 375px) {
  .main-title {
    font-size: 16px;
  }
  .group-bind-card {
    padding: 8px 10px;
  }
}
</style>
