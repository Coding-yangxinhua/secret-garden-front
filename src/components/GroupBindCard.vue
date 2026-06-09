<template>
  <div class="gb-card">
    <!-- ====== 未绑定 ====== -->
    <template v-if="!isBound">
      <div class="gb-hero">
        <div class="gb-hero-emoji">🎁</div>
        <h1 class="gb-hero-title">进群有礼</h1>
        <p class="gb-hero-subtitle">绑定群号赠送 1 天会员时长</p>
      </div>

      <div class="gb-group">
        <div class="gb-row">
          <div class="gb-row-left">
            <span class="gb-label">群号</span>
          </div>
          <div class="gb-row-right">
            <van-field
              v-model="groupName"
              placeholder="输入群号"
              class="gb-field"
              clearable
              :border="false"
              :disabled="isBinding"
            />
          </div>
        </div>
      </div>

      <button class="gb-action" :disabled="!groupName.trim() || isBinding" @click="handleBind">
        <span v-if="isBinding" class="gb-spinner"></span>
        <span v-else>绑定并领取时长</span>
      </button>
      <p class="gb-exchange" @click="handleGoExchange">已有卡密？去兑换</p>

      <transition name="gb-pop">
        <div v-if="purchaseLink" class="gb-result">
          <div class="gb-callout">
            <span>✅ 绑定成功，1 天时长已到账</span>
          </div>
          <div class="gb-group">
            <div class="gb-row">
              <div class="gb-row-left">
                <span class="gb-label">购买链接</span>
              </div>
              <div class="gb-row-right">
                <span class="gb-url">{{ purchaseLink }}</span>
                <van-icon name="arrow" size="14" class="gb-arrow" />
              </div>
            </div>
          </div>
          <button class="gb-action gb-action-blue" @click="handleJumpToBuy">
            跳转购买
            <van-icon name="arrow" size="16" />
          </button>
        </div>
      </transition>
    </template>

    <!-- ====== 已绑定 ====== -->
    <template v-else>
      <div class="gb-hero gb-hero-bound">
        <div class="gb-hero-emoji">✅</div>
        <div>
          <p class="gb-hero-title gb-hero-title-bound">已绑定</p>
          <p class="gb-hero-subtitle">你已绑定过群，直接购买即可</p>
        </div>
      </div>

      <div class="gb-group">
        <div class="gb-row">
          <div class="gb-row-left">
            <span class="gb-label">购买链接</span>
          </div>
          <div class="gb-row-right">
            <span class="gb-url">{{ purchaseLink || '获取中…' }}</span>
            <van-icon name="arrow" size="14" class="gb-arrow" />
          </div>
        </div>
      </div>

      <button class="gb-action gb-action-blue" :disabled="!purchaseLink" @click="handleJumpToBuy">
        <span v-if="isFetchingLink" class="gb-spinner"></span>
        <span v-else>跳转购买 <van-icon name="arrow" size="16" /></span>
      </button>
      <p class="gb-exchange" @click="handleGoExchange">已有卡密？去兑换</p>
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
      method: 'GET',
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
/* ============================================================
   GroupBindCard — iOS 17 Settings 原生列表风格
   分组 = 白底圆角列表行，无额外包裹 / 磨砂 / 渐变
   ============================================================ */

.gb-card {
  padding: 8px 0 4px;
}

/* ---------- Hero 头部 ---------- */
.gb-hero {
  text-align: center;
  padding: 20px 0 28px;
}
.gb-hero-emoji {
  font-size: 48px;
  display: block;
  margin-bottom: 14px;
}
.gb-hero-title {
  font-size: 24px;
  font-weight: 630;
  letter-spacing: -0.3px;
  color: #1d1d1f;
  margin: 0 0 6px;
}
.gb-hero-subtitle {
  font-size: 13px;
  color: #8e8e93;
  margin: 0;
}

/* 绑定过的 Hero 缩略版 */
.gb-hero-bound {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0 20px;
  text-align: left;
}
.gb-hero-bound .gb-hero-emoji {
  font-size: 32px;
  margin-bottom: 0;
  flex-shrink: 0;
}
.gb-hero-bound .gb-hero-title {
  font-size: 17px;
  margin-bottom: 2px;
}
.gb-hero-title-bound {
  color: #34c759;
}
.gb-hero-bound .gb-hero-subtitle {
  font-size: 12px;
}

/* ---------- 分组列表 ---------- */
.gb-group {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

/* ---------- 列表行 ---------- */
.gb-row {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 6px 16px;
  gap: 12px;
}
.gb-row + .gb-row {
  border-top: 0.5px solid #e9e9ed;
}
.gb-row-left {
  flex-shrink: 0;
}
.gb-row-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  gap: 4px;
}
.gb-label {
  font-size: 16px;
  color: #1d1d1f;
}

/* ---------- 输入框（Settings 风格右对齐） ---------- */
.gb-field {
  --van-field-padding: 4px 0 4px 8px;
  --van-field-input-font-size: 16px;
  --van-field-placeholder-color: #c7c7cc;
  --van-field-input-color: #1d1d1f;
  --van-field-input-text-align: right;
  --van-field-clear-icon-color: #c7c7cc;
  --van-field-clear-icon-size: 14px;
  background: transparent;
}

/* ---------- 链接文本（蓝色右对齐） ---------- */
.gb-url {
  font-size: 14px;
  color: #007aff;
  text-align: right;
  word-break: break-all;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.gb-arrow {
  color: #c7c7cc;
  flex-shrink: 0;
}

/* ---------- 操作按钮 ---------- */
.gb-action {
  display: block;
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: #ff6767;
  color: #fff;
  font-size: 16px;
  font-weight: 590;
  cursor: pointer;
  transition: opacity 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.gb-action:active {
  opacity: 0.8;
}
.gb-action:disabled {
  background: #e0e0e0;
  color: #fff;
  cursor: not-allowed;
}
.gb-action-blue {
  background: #007aff;
}

/* ---------- 兑换链接脚注 ---------- */
.gb-exchange {
  text-align: center;
  font-size: 14px;
  color: #007aff;
  margin: 12px 0 0;
  cursor: pointer;
}
.gb-exchange:active {
  opacity: 0.5;
}

/* ---------- 绑定成功结果区 ---------- */
.gb-result {
  margin-top: 20px;
}
.gb-callout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  margin-bottom: 16px;
  background: #f0faf0;
  border-radius: 10px;
  font-size: 14px;
  color: #2e7d32;
  border: 1px solid #c6e6c6;
}

/* ---------- 弹簧动画 ---------- */
.gb-pop-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.gb-pop-leave-active {
  transition: all 0.2s;
}
.gb-pop-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}
.gb-pop-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.96);
}

/* ---------- 加载圈 ---------- */
.gb-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: gb-spin 0.6s linear infinite;
}
@keyframes gb-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-color-scheme: dark) {
  .gb-group {
    background: #2c2c2e;
  }
  .gb-row + .gb-row {
    border-top-color: #38383a;
  }
  .gb-label {
    color: #f2f2f7;
  }
  .gb-hero-title {
    color: #f2f2f7;
  }
  .gb-url {
    color: #0a84ff;
  }
  .gb-field {
    --van-field-input-color: #f2f2f7;
    --van-field-placeholder-color: #636366;
  }
  .gb-callout {
    background: #1c3a1c;
    color: #30d158;
    border-color: #2c5c2c;
  }
}
</style>
