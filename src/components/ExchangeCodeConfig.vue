<template>
  <div class="exchange-code-card apple-card">
    <div class="apple-card-header">
      <cute-icon name="gift-voucher" size="20" color="#ff6767" />
      <span class="apple-card-title">兑换码功能</span>
    </div>
    <div class="apple-card-content">
      <!-- 自动兑换开关 -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动兑换</div>
          <div class="apple-cell-label">开启后系统将自动兑换可用的兑换码</div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :modelValue="autoExchange"
            @update:modelValue="$emit('update:autoExchange', $event)"
            size="22"
          />
        </div>
      </div>

      <!-- 分享兑换码 -->
      <div class="apple-sub-header" style="margin-top: 16px">
        <van-icon name="share-o" size="14" color="#86868B" />
        <span>分享兑换码</span>
      </div>

      <div class="exchange-code-field-row">
        <div class="exchange-code-label">兑换码</div>
        <div class="exchange-code-input-wrap">
          <van-field
            v-model="codeInput"
            :placeholder="latestCdKey || '暂无最新兑换码'"
            class="exchange-code-input"
            clearable
          />
        </div>
        <button class="exchange-code-btn" :disabled="submitting" @click="submitCode">
          {{ submitting ? '提交中...' : '提交' }}
        </button>
      </div>

      <div class="exchange-code-tip">
        <van-icon name="info-o" size="13" color="#aeaeb2" />
        <span>分享成功将奖励一天可分配时长，大家不要把专属兑换码分享了哦！</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showNotify } from 'vant'
import request from '@/utils/request'

const props = defineProps({
  autoExchange: Boolean,
  currentUserId: String,
})

const emit = defineEmits(['update:autoExchange'])

// 输入与状态
const codeInput = ref('')
const latestCdKey = ref('')
const submitting = ref(false)

// 获取最新兑换码
const fetchLatestCdKey = async () => {
  try {
    const { data } = await request({ method: 'get', url: '/config/getCdKey' })
    latestCdKey.value = data
  } catch {}
}

// 提交分享兑换码
const submitCode = async () => {
  if (!codeInput.value.trim()) {
    showNotify({ type: 'warning', message: '请输入兑换码' })
    return
  }
  submitting.value = true
  try {
    const res = await request({
      method: 'get',
      url: '/config/shareCdKey',
      params: { userId: props.currentUserId, cdKey: codeInput.value.trim() },
    })
    showNotify({
      type: res.code === 200 ? 'success' : 'danger',
      message: res.data || res.remark || '操作失败',
    })
    if (res.code === 200) codeInput.value = ''
  } finally {
    submitting.value = false
  }
}

onMounted(fetchLatestCdKey)
</script>

<style scoped>
/* ============================================================
   🎁 ExchangeCodeConfig — iOS 17 Settings 风格
   通用样式见 apple-card.css（全局）
   ============================================================ */

/* ---------- 卡片容器微调 ---------- */
.exchange-code-card {
  margin-bottom: 16px;
}

.exchange-code-card .apple-card-header {
  padding: 16px 16px 0;
}

.exchange-code-card .apple-card-content {
  padding: 4px 16px 12px;
}

/* ---------- 兑换码输入行（圆角容器） ---------- */
.exchange-code-field-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--apple-bg-secondary, #f2f2f7);
  border-radius: 12px;
  margin-top: 8px;
}

.exchange-code-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--apple-text-primary, #1d1d1f);
  white-space: nowrap;
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
}

.exchange-code-input-wrap {
  flex: 1;
  min-width: 0;
}

.exchange-code-input {
  width: 100%;
  --van-field-background: transparent;
  --van-cell-background: transparent;
  --van-field-border: none;
  --van-cell-border: none;
  --van-field-input-text-color: var(--apple-text-primary, #1d1d1f);
  --van-field-placeholder-text-color: var(--apple-text-quaternary, #c7c7cc);
  padding: 0;
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
}

.exchange-code-input :deep(.van-field__body) {
  background: transparent;
}

/* ---------- 粉色提交按钮 ---------- */
.exchange-code-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: #ff6767;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
  white-space: nowrap;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 2px 8px rgba(255, 103, 103, 0.25);
}

.exchange-code-btn:active {
  transform: scale(0.94);
  opacity: 0.85;
}

.exchange-code-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ---------- 底部提示文字 ---------- */
.exchange-code-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  padding: 0 4px;
  font-size: 11px;
  color: var(--apple-text-tertiary, #aeaeb2);
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
}
</style>
