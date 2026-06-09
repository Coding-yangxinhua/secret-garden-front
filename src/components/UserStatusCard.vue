<template>
  <div class="status-section">
    <!-- 【新增】顶部标题区域 -->
    <div class="top-title-bar">
      <h1 class="app-title">莳花小助手</h1>
      <span class="version-number">v{{ systemVersion }}</span>
    </div>

    <div class="status-grid" :class="{ 'has-user-card': otherUsers?.length > 1 }">
      <!-- 运行状态卡片 -->
      <div
        class="status-card"
        :style="{
          backgroundColor: runningStatusDesc.bgColor,
          borderColor: runningStatusDesc.borderColor,
          color: runningStatusDesc.color,
        }"
      >
        <cute-icon
          :name="runningStatusDesc.icon"
          :size="statusIconSize"
          :color="runningStatusDesc.color"
        />
        <div class="status-text">{{ runningStatusDesc.text }}</div>
      </div>

      <!-- VIP状态卡片 -->
      <div
        class="status-card"
        :style="{
          backgroundColor: vipStatusStyle.bgColor,
          color: vipStatusStyle.color,
        }"
        @click="showTimeAllocationPopup = true"
      >
        <cute-icon name="vip" size="22" :color="vipStatusStyle.color" />
        <div class="status-text vip-status-text">{{ vipStatusDisplay }}</div>
      </div>

      <!-- 用户选择卡片 -->
      <div class="status-card user-card mobile-full-width" v-if="otherUsers?.length > 1">
        <cute-icon name="users" size="22" color="#ff6767" />
        <div class="user-selector">
          <div class="selected-user" @click="toggleUserDropdown">
            <span class="user-name">{{
              currentSelectedUser?.nickName ||
              currentSelectedUser?.userName ||
              currentSelectedUser?.openId
            }}</span>
            <cute-icon
              :name="showUserDropdown ? 'arrow-up' : 'arrow-down'"
              size="22"
              color="#8c8c8c"
              class="dropdown-arrow"
            />
          </div>

          <!-- 自定义下拉选择框 -->
          <transition name="dropdown">
            <div v-show="showUserDropdown" class="user-dropdown">
              <div class="user-list">
                <div
                  v-for="otherUser in otherUsers"
                  :key="otherUser.id"
                  class="user-item"
                  :class="{ selected: otherUser.id === currentUserValue }"
                  @click="selectUser(otherUser.id)"
                >
                  <div class="user-info">
                    <span class="user-name">{{ otherUser.nickName || otherUser.userName }}</span>
                    <span class="user-openid" v-if="otherUser.nickName && otherUser.userName">
                      {{ otherUser.userName }}
                    </span>
                  </div>
                  <div class="user-status">
                    <span class="user-status-badge" :class="getUserStatusClass(otherUser)">
                      {{ getUserStatusText(otherUser) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- 用户名展示（单用户情况） -->
      <div class="status-card user-card mobile-full-width" v-else>
        <cute-icon name="user" size="22" color="#ff6767" />
        <div class="status-text username-text">
          {{
            currentSelectedUser?.nickName ||
            currentSelectedUser?.userName ||
            currentSelectedUser?.openId
          }}
        </div>
      </div>
    </div>
    <Teleport to="body">
      <!-- ⬆️ 分配时间 - iOS 17 底部 Sheet -->
      <div v-if="showTimeAllocationPopup" class="modal-overlay" @click="closePopup">
        <div class="modal-content" @click.stop>
          <!-- 灰色把手 -->
          <div class="modal-handle"></div>

          <!-- ⚡ 标题区 -->
          <div class="modal-title-block">
            <p class="modal-subtitle">分配到</p>
            <h2 class="modal-title">{{ currentSelectedUser?.nickName || '未知用户' }}</h2>
          </div>

          <div class="modal-body">
            <!-- 权限警告 -->
            <div v-if="showPermissionWarning" class="modal-alert">
              <span>⚠️ 仅到期可操作</span>
            </div>

            <!-- 📦 库存展示 - 胶囊标签 -->
            <div class="stock-row">
              <div class="stock-pill">
                <span class="stock-label">不可暂停</span>
                <span class="stock-value" :class="realNonPauseableDaysClass">{{
                  availableTimes.nonPauseableDays
                }}</span>
                <span class="stock-unit">天</span>
              </div>
              <div class="stock-pill">
                <span class="stock-label">可暂停</span>
                <span class="stock-value" :class="realPauseableDaysClass">
                  {{
                    showRecycleAdd
                      ? availableTimes.pauseableDays + Math.abs(allocationPauseDays)
                      : availableTimes.pauseableDays
                  }}
                </span>
                <span class="stock-unit">天</span>
              </div>
            </div>

            <!-- 🔢 天数调整 -->
            <div class="adjust-block">
              <div class="adjust-header">
                <span>调整天数</span>
                <span class="adjust-to" :class="timePartClass">{{ previewVipTimeRemaining }}</span>
              </div>
              <div class="adjust-controls">
                <button
                  class="adjust-btn"
                  :disabled="!canDecreaseDays || showPermissionWarning"
                  @click="decreaseDays"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  >
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <div class="adjust-display">
                  <span class="adjust-number">{{ allocationPauseDays }}</span>
                  <span class="adjust-unit">天</span>
                </div>
                <button
                  class="adjust-btn"
                  :disabled="!canIncreaseDays || showPermissionWarning"
                  @click="increaseDays"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  >
                    <path d="M5 12h14M12 5v14" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 🚀 主要操作 -->
            <button
              class="modal-primary"
              :disabled="!canConfirmAllocation || showPermissionWarning"
              @click="confirmAllocation"
            >
              确认分配
            </button>
            <button class="modal-dismiss" @click="closePopup">取消</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, defineExpose } from 'vue'
import CuteIcon from '@/components/CuteIcon.vue'
import request from '@/utils/request'
import { showLoadingToast, showNotify } from 'vant'

// 🔥 全局安全日期解析（兼容所有设备：iOS/安卓/所有浏览器）
const safeParseDate = (dateStr) => {
  if (!dateStr) return 0
  try {
    // 核心：把横杠 - 替换为斜杠 /，解决iOS/Safari不兼容问题
    const standardStr = dateStr.replace(/-/g, '/')
    const time = new Date(standardStr).getTime()
    // 兜底：解析失败返回0，避免NaN
    return isNaN(time) ? 0 : time
  } catch (e) {
    return 0
  }
}

const props = defineProps({
  systemUser: { type: Object, required: true },
})
const emit = defineEmits(['update:currentUser', 'allot-success'])

// 响应式数据
const showUserDropdown = ref(false)
const currentUserValue = ref(props.systemUser?.currentUser?.id || null)
const vipStatusDisplay = ref('')
const showTimeAllocationPopup = ref(false)
const allocationPauseDays = ref(1)
// 🔥 修复：响应式当前时间（解决倒计时不更新问题）
const now = ref(Date.now())
let countdownTimer = null

// 计算属性：获取系统用户ID
const systemUserId = computed(() => props.systemUser?.id)

// 计算属性：检查权限
const showPermissionWarning = computed(() => {
  if (isVipExpired.value) return false
  const subscribe = currentSelectedUser.value?.subscribe
  if (!subscribe || typeof subscribe.allotSystemUserId === 'undefined') return false
  const allotSystemUserId = subscribe.allotSystemUserId
  const currentSystemUserId = systemUserId.value
  return (
    allotSystemUserId != 0 &&
    allotSystemUserId !== currentSystemUserId &&
    currentUserRemainDays.value >= 1
  )
})

// 真实原始库存（不扣减预览）
const realAvailableTimes = computed(() => {
  let nonPauseable = 0,
    pauseable = 0
  if (props.systemUser?.times && Array.isArray(props.systemUser.times)) {
    props.systemUser.times.forEach((t) => {
      if (t.pauseEnable === 0) nonPauseable += t.hours
      else if (t.pauseEnable === 1) pauseable += t.hours
    })
  }
  return {
    nonPauseable,
    pauseable,
    nonPauseableDays: Math.floor(nonPauseable / 24),
    pauseableDays: Math.floor(pauseable / 24),
  }
})

// 显示用库存（分配时实时扣减）
const availableTimes = computed(() => {
  let np = realAvailableTimes.value.nonPauseable
  let p = realAvailableTimes.value.pauseable

  const addDays = allocationPauseDays.value > 0 ? allocationPauseDays.value : 0
  const addHours = addDays * 24

  if (isVipExpired.value) {
    if (autoAllocationType.value === 'pauseable') {
      p = Math.max(0, p - addHours)
    } else {
      np = Math.max(0, np - addHours)
    }
  } else {
    if (currentSubscribeType.value === '可暂停') {
      p = Math.max(0, p - addHours)
    } else {
      np = Math.max(0, np - addHours)
    }
  }

  return {
    nonPauseable: np,
    pauseable: p,
    nonPauseableDays: Math.floor(np / 24),
    pauseableDays: Math.floor(p / 24),
  }
})

// 库存颜色
const realNonPauseableDaysClass = computed(() => {
  const show = availableTimes.value.nonPauseableDays
  const real = realAvailableTimes.value.nonPauseableDays
  if (show < real) return 'red'
  if (show > real) return 'green'
  return ''
})
const realPauseableDaysClass = computed(() => {
  const show = availableTimes.value.pauseableDays
  const real = realAvailableTimes.value.pauseableDays
  if (show < real) return 'red'
  if (show > real) return 'green'
  return ''
})

const currentSelectedUser = computed(() => {
  if (props.systemUser?.currentUser) return props.systemUser.currentUser
  if (props.systemUser?.otherUsers && currentUserValue.value) {
    return (
      props.systemUser.otherUsers.find((u) => u.id === currentUserValue.value) ||
      props.systemUser.otherUsers[0]
    )
  }
  return null
})

const otherUsers = computed(() => props.systemUser?.otherUsers || [])

// 🔥 终极修复：剩余时间计算，彻底杜绝跳变
const vipRemainingTime = computed(() => {
  const sub = currentSelectedUser.value?.subscribe
  if (!sub || sub.subscribeId == -1 || !sub.validUtil) return 0

  const validUtilTime = safeParseDate(sub.validUtil)
  // 已暂停 → 固定服务器时间，不参与任何本地计算（绝对不跳）
  if (sub.pauseEnable === 1 && sub.pauseTime > 0) {
    const fixedTime = validUtilTime - Number(sub.pauseTime)
    return Math.max(0, fixedTime)
  }
  // 未暂停 → 正常计算，但强制兜底不出现负数
  return Math.max(0, validUtilTime - now.value)
})

// 🔥 修复：正确的VIP过期判断
const isVipExpired = computed(() => {
  const sub = currentSelectedUser.value?.subscribe
  if (!sub || sub.subscribeId == -1) return true
  if (!sub.validUtil) return false
  return vipRemainingTime.value <= 0
})

// 自动选择分配类型
const autoAllocationType = computed(() => {
  if (!isVipExpired.value) return 'nonPauseable'
  if (realAvailableTimes.value.nonPauseableDays > 0) {
    return 'nonPauseable'
  } else if (realAvailableTimes.value.pauseableDays > 0) {
    return 'pauseable'
  }
  return 'nonPauseable'
})

// 当前用户真实剩余天数
const currentUserRemainDays = computed(() => {
  if (isVipExpired.value) return 0
  return Math.max(0, Math.floor(vipRemainingTime.value / (1000 * 60 * 60 * 24)))
})

// 预览天数颜色
const timePartClass = computed(() => {
  if (isVipExpired.value) return allocationPauseDays.value > 0 ? 'green' : ''
  const real = currentUserRemainDays.value
  const preview = real + allocationPauseDays.value
  if (preview > real) return 'green'
  if (preview < real) return 'red'
  return ''
})

const showRecycleAdd = computed(() => {
  return (
    !isVipExpired.value && currentSubscribeType.value === '可暂停' && allocationPauseDays.value < 0
  )
})

const currentSubscribeType = computed(() => {
  const sub = currentSelectedUser.value?.subscribe
  return sub?.pauseEnable === 1 ? '可暂停' : '不可暂停'
})

// + 号限制
const canIncreaseDays = computed(() => {
  if (showPermissionWarning.value) return false
  if (isVipExpired.value) {
    if (autoAllocationType.value === 'pauseable') {
      return allocationPauseDays.value + 1 <= realAvailableTimes.value.pauseableDays
    } else {
      return allocationPauseDays.value + 1 <= realAvailableTimes.value.nonPauseableDays
    }
  }
  if (currentSubscribeType.value === '可暂停') {
    return allocationPauseDays.value + 1 <= realAvailableTimes.value.pauseableDays
  } else {
    return allocationPauseDays.value + 1 <= realAvailableTimes.value.nonPauseableDays
  }
})

// - 号限制
const canDecreaseDays = computed(() => {
  if (showPermissionWarning.value) return false
  if (allocationPauseDays.value > 0) return true
  if (isVipExpired.value) return false
  if (currentSubscribeType.value !== '可暂停') return false
  const afterReduce = currentUserRemainDays.value + allocationPauseDays.value - 1
  return afterReduce >= 0
})

// 确认按钮
const canConfirmAllocation = computed(() => {
  if (showPermissionWarning.value) return false
  if (allocationPauseDays.value > 0) {
    if (isVipExpired.value) {
      if (autoAllocationType.value === 'pauseable') {
        return allocationPauseDays.value <= realAvailableTimes.value.pauseableDays
      } else {
        return allocationPauseDays.value <= realAvailableTimes.value.nonPauseableDays
      }
    } else {
      if (currentSubscribeType.value === '可暂停') {
        return allocationPauseDays.value <= realAvailableTimes.value.pauseableDays
      } else {
        return allocationPauseDays.value <= realAvailableTimes.value.nonPauseableDays
      }
    }
  }
  if (allocationPauseDays.value < 0) {
    const after = currentUserRemainDays.value + allocationPauseDays.value
    return !isVipExpired.value && currentSubscribeType.value === '可暂停' && after >= 0
  }
  return false
})

// 预览时间
const previewVipTimeRemaining = computed(() => {
  const sub = currentSelectedUser.value?.subscribe
  if (!sub || sub.subscribeId == -1) {
    return allocationPauseDays.value > 0
      ? `${Math.abs(allocationPauseDays.value)}天后到期`
      : '无VIP'
  }

  // ✅ 统一使用安全解析函数
  const validUtil = safeParseDate(sub.validUtil)
  const addTime = allocationPauseDays.value * 86400000

  if (!sub.validUtil) return '永久有效'
  if (validUtil === 0) return '时间异常'

  if (isVipExpired.value) {
    const d = new Date(Date.now() + Math.abs(addTime))
    return d.toLocaleDateString()
  }

  const final = Math.max(0, vipRemainingTime.value + addTime)
  if (final <= 0) return '已过期'

  const days = Math.floor(final / 86400000)
  const hours = Math.floor((final % 86400000) / 3600000)
  const mins = Math.floor((final % 3600000) / 60000)
  const secs = Math.floor((final % 60000) / 1000)

  return `${days}天${hours}小时${mins}分钟${secs}秒后到期`
})

// 运行状态图标映射（适配 cute-icon）
const runningStatusIconMap = {
  loading: 'grid',
  refreshNeed: 'login',
  stopped: 'pause',
  running: 'play',
  waiting: 'flower',
  unknown: 'more',
}

// 运行状态
const runningStatusDesc = computed(() => {
  const u = currentSelectedUser.value
  if (!u)
    return {
      icon: runningStatusIconMap.loading,
      text: '加载中',
      color: '#8c8c8c',
      bgColor: 'rgba(140,140,140,0.1)',
      borderColor: 'rgba(140,140,140,0.2)',
    }
  if (u.refreshNeed === 1)
    return {
      icon: runningStatusIconMap.refreshNeed,
      text: '需重新登录',
      color: '#ff4d4f',
      bgColor: 'rgba(255,77,79,0.1)',
      borderColor: 'rgba(255,77,79,0.2)',
    }
  if (u.runStatus === 0)
    return {
      icon: runningStatusIconMap.stopped,
      text: '未启用',
      color: '#8c8c8c',
      bgColor: 'rgba(140,140,140,0.1)',
      borderColor: 'rgba(140,140,140,0.2)',
    }
  if (u.runStatus === 1)
    return {
      icon: runningStatusIconMap.running,
      text: '运行中',
      color: '#52c41a',
      bgColor: 'rgba(82,196,26,0.1)',
      borderColor: 'rgba(82,196,26,0.2)',
    }
  if (u.runStatus === 2)
    return {
      icon: runningStatusIconMap.waiting,
      text: '等待中',
      color: '#52c41a',
      bgColor: 'rgba(82,196,26,0.1)',
      borderColor: 'rgba(82,196,26,0.2)',
    }
  return {
    icon: runningStatusIconMap.unknown,
    text: '未知状态',
    color: '#8c8c8c',
    bgColor: 'rgba(140,140,140,0.1)',
    borderColor: 'rgba(140,140,140,0.2)',
  }
})

const getUserStatusText = (u) => {
  if (!u) return ''
  if (u.refreshNeed === 1) return '需登录'
  if (u.runStatus === 0) return '未运行'
  if (u.runStatus === 1) return '运行中'
  if (u.runStatus === 2) return '等待中'
  return '未知'
}
const getUserStatusClass = (u) => {
  if (!u) return ''
  if (u.refreshNeed === 1) return 'status-need-login'
  if (u.runStatus === 0) return 'status-stopped'
  if (u.runStatus === 1) return 'status-running'
  if (u.runStatus === 2) return 'status-waiting'
  return 'status-unknown'
}

// 状态图标大小（移动端适配）
const statusIconSize = computed(() => {
  // 窗口宽度 <= 575px 时缩小图标
  if (typeof window !== 'undefined' && window.innerWidth <= 575) {
    return '20'
  }
  return '28'
})

// VIP样式
const vipStatusStyle = computed(() => {
  const sub = currentSelectedUser.value?.subscribe
  if (!sub || sub.subscribeId == -1) return { color: '#8c8c8c', bgColor: 'rgba(140,140,140,0.1)' }
  if (!sub.validUtil) return { color: '#722ed1', bgColor: 'rgba(114,46,209,0.1)' }
  if (isVipExpired.value) {
    return { color: '#ff4d4f', bgColor: 'rgba(255,77,79,0.1)' }
  }
  return { color: '#1890ff', bgColor: 'rgba(24,144,255,0.1)' }
})

// 🔥 终极修复：暂停状态固定显示，绝不跳动
const updateVipStatus = () => {
  const sub = currentSelectedUser.value?.subscribe
  if (!sub || sub.subscribeId == -1) {
    vipStatusDisplay.value = '暂无VIP'
    return
  }
  // 🔥 全局强制转数字（唯一改动）
  const pauseTime = Number(sub.pauseTime) || 0

  if (!sub.validUtil) {
    vipStatusDisplay.value = '永久有效'
    return
  }

  const validUtilTime = safeParseDate(sub.validUtil)
  if (validUtilTime === 0) {
    vipStatusDisplay.value = '时间异常'
    return
  }

  if (isVipExpired.value) {
    const expiredDate = new Date(validUtilTime).toLocaleDateString()
    vipStatusDisplay.value = `${expiredDate} 已过期`
    return
  }

  // 不可暂停 VIP：固定日期
  if (sub.pauseEnable === 0) {
    const expiredDate = new Date(validUtilTime).toLocaleDateString()
    vipStatusDisplay.value = `${expiredDate} 到期`
    return
  }

  // ==============================================
  // 🔥 核心：已暂停 → 锁死服务器时间，本地不做任何倒计时
  // ==============================================
  if (sub.pauseEnable === 1 && pauseTime > 0) {
    const remain = vipRemainingTime.value
    const d = Math.floor(remain / 86400000)
    const h = Math.floor((remain % 86400000) / 3600000)
    const m = Math.floor((remain % 3600000) / 60000)
    const s = Math.floor((remain % 60000) / 1000)
    vipStatusDisplay.value = `${d}天${h}小时${m}分钟${s}秒后到期`
    return
  }

  // ==============================================
  // 🔥 核心：未暂停 → 正常实时倒计时
  // ==============================================
  if (sub.pauseEnable === 1 && pauseTime == 0) {
    const remain = vipRemainingTime.value
    const d = Math.floor(remain / 86400000)
    const h = Math.floor((remain % 86400000) / 3600000)
    const m = Math.floor((remain % 3600000) / 60000)
    const s = Math.floor((remain % 60000) / 1000)
    vipStatusDisplay.value = `${d}天${h}小时${m}分钟${s}秒后到期`
  }
}

// 🔥 终极修复：延迟启动倒计时，杜绝恢复瞬间时间跳变
const startCountdown = () => {
  stopCountdown()
  const sub = currentSelectedUser.value?.subscribe
  if (!sub) return
  // 🔥 全局强制转数字（唯一改动）
  const pauseTime = Number(sub.pauseTime) || 0

  // 只有满足条件，才延迟10ms启动（等待数据完全更新）
  if (sub.pauseEnable === 1 && pauseTime == 0 && !isVipExpired.value) {
    setTimeout(() => {
      now.value = Date.now() // 强制同步最新时间
      updateVipStatus()
      countdownTimer = setInterval(() => {
        now.value = Date.now()
        updateVipStatus()
      }, 1000)
    }, 10)
  }
}
const stopCountdown = () => clearInterval(countdownTimer)

// 操作方法
const increaseDays = () => {
  if (canIncreaseDays.value) allocationPauseDays.value += 1
}
const decreaseDays = () => {
  if (canDecreaseDays.value) allocationPauseDays.value -= 1
}
const closePopup = () => {
  showTimeAllocationPopup.value = false
}
const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

// 手动输入天数校验
const handleDaysInput = (e) => {
  let val = parseInt(e.target.value)
  if (isNaN(val)) val = 0

  const minVal = isVipExpired.value
    ? 0
    : currentSubscribeType.value === '可暂停'
      ? -(currentUserRemainDays.value - 1)
      : 0
  const maxVal = isVipExpired.value
    ? autoAllocationType.value === 'pauseable'
      ? realAvailableTimes.value.pauseableDays
      : realAvailableTimes.value.nonPauseableDays
    : currentSubscribeType.value === '可暂停'
      ? realAvailableTimes.value.pauseableDays
      : realAvailableTimes.value.nonPauseableDays

  allocationPauseDays.value = Math.max(minVal, Math.min(maxVal, val))
}

const selectUser = (id) => {
  currentUserValue.value = id
  emit('update:currentUser', id)
  showUserDropdown.value = false
}
const closeDropdownIfClickedOutside = (e) => {
  if (!e.target.closest('.user-selector')) showUserDropdown.value = false
}

// 确认分配
const confirmAllocation = async () => {
  if (!canConfirmAllocation.value) {
    return
  }
  try {
    const isRecycle = allocationPauseDays.value < 0
    const days = Math.abs(allocationPauseDays.value)
    const hours = days * 24

    const pauseEnable = isVipExpired.value
      ? autoAllocationType.value === 'pauseable'
        ? 1
        : 0
      : currentSubscribeType.value === '可暂停'
        ? 1
        : 0
    showLoadingToast({
      message: '分配中...',
      teleport: 'body', // 核心：挂载到body，层级最高
      forbidClick: true, // 禁止点击背景
    })
    const res = await request({
      url: '/subscribe/allot?userId=' + currentSelectedUser.value.id,
      method: 'POST',
      data: {
        hours: isRecycle ? -hours : hours,
        pauseEnable: pauseEnable,
      },
    })

    if (res.code == 200) {
      emit('update:currentUser', currentSelectedUser.value.id)
      emit('allot-success')
      showNotify({
        type: 'success',
        message: '分配时间成功！',
        duration: 2000,
      })
      showTimeAllocationPopup.value = false
      allocationPauseDays.value = 0
    } else {
      showNotify({ type: 'fail', message: '分配时间失败！' })
    }
  } catch (err) {
    showNotify({ type: 'fail', message: '分配时间失败！' })
  }
}

// 系统版本
const systemVersion = localStorage.getItem('system_version') || '1.0.0'

// 监听
watch(
  () => props.systemUser?.currentUser?.id,
  (id) => {
    currentUserValue.value = id
  },
  { immediate: true },
)

watch(
  () => currentSelectedUser.value?.subscribe,
  (sub) => {
    // 🔥 强制重置：清空定时器 + 同步时间
    stopCountdown()
    now.value = Date.now()
    updateVipStatus()

    if (!sub) return
    // 🔥 全局强制转数字（唯一改动）
    const pauseTime = Number(sub.pauseTime) || 0
    // 符合条件才启动倒计时
    if (sub.pauseEnable === 1 && pauseTime == 0 && !isVipExpired.value) {
      startCountdown()
    }

    if (!showTimeAllocationPopup.value) {
      allocationPauseDays.value = 0
    }
  },
  { deep: true, immediate: true },
)

onMounted(async () => {
  document.addEventListener('click', closeDropdownIfClickedOutside)
  await nextTick()
  updateVipStatus()
  startCountdown()
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdownIfClickedOutside)
  clearInterval(countdownTimer)
})

// 供父组件调用的公开方法：打开时长分配弹窗
const openAllocationPopup = () => {
  allocationPauseDays.value = 1
  showTimeAllocationPopup.value = true
}

defineExpose({
  openAllocationPopup,
})
</script>

<style scoped>
/* 🔥 白色磨砂容器，与背景区分 */
.status-section {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 10px 12px;
  margin-bottom: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* 🔥 超窄版顶部标题（移动端极致省空间） */
.top-title-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  text-align: center;
  background: transparent;
  border-bottom: none;
  margin: 0 0 6px 0;
}

.app-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #2a3554;
  letter-spacing: 0.6px;
}

.version-number {
  font-size: 11px;
  color: #8c93a5;
  font-weight: 500;
  align-self: flex-end;
  padding-bottom: 1px;
}

.status-grid {
  display: grid;
  gap: 6px;
}
.status-grid:not(.has-user-card) {
  grid-template-columns: repeat(2, 1fr);
}
.status-grid.has-user-card {
  grid-template-columns: repeat(2, 1fr);
}
.status-card {
  max-height: 56px;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.status-card:active {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
.status-text {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
}
.user-card {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-color: rgba(24, 144, 255, 0.15);
}
.username-text {
  color: #ff6767;
  font-weight: 600;
}
.user-selector {
  flex: 1;
  margin-left: 4px;
  position: relative;
  /* ✅ 新增：允许子元素溢出显示 */
  overflow: visible !important;
}
.selected-user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  cursor: pointer;
  padding: 4px 0;
}
.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
  flex: 1;
}
.dropdown-arrow {
  margin-left: 8px;
  transition: transform 0.3s;
}
/* 替换原 .user-dropdown 样式 */
.user-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  min-width: 150px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  z-index: 10001;
  margin-top: 8px;
  /* ✅ 修复：外层不要overflow:hidden，交给内层滚动 */
  overflow: visible !important;
  max-height: none;
  /* ✅ 修复：创建独立堆叠上下文，防止被父容器裁剪 */
  transform: translateZ(0);
}

/* 替换原 .user-list 样式 */
.user-list {
  /* ✅ 修复：只给内层设置滚动高度 */
  max-height: 280px;
  overflow-y: auto;
  /* ✅ 修复：移动端滚动流畅度 */
  -webkit-overflow-scrolling: touch;
}
.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f5f5f5;
}
.user-item:last-child {
  border-bottom: none;
}
.user-item:hover {
  background: #f8f9fa;
}
.user-item.selected {
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
}
.user-info {
  display: flex;
  min-width: 0;
  flex: 1;
}
.user-openid {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}
.user-status {
  display: flex;
  align-items: center;
  margin-left: 10px;
}
.user-status-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-top: 2px;
}
.user-status-badge.status-running {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}
.user-status-badge.status-waiting {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}
.user-status-badge.status-stopped {
  background: #f5f5f5;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
}
.user-status-badge.status-need-login {
  background: #fff2e8;
  color: #fa8c16;
  border: 1px solid #ffd591;
}
.user-status-badge.status-unknown {
  background: #f9f9f9;
  color: #bfbfbf;
  border: 1px solid #d9d9d9;
}
/* 替换原过渡样式 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s;
  /* ✅ 修复：动画用固定大高度，不限制内容 */
  max-height: 500px;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

/* ============================================================
   ⬆️ iOS 17 底部 Sheet — 纯色大标题 + 胶囊标签 + 轻拟态
   ============================================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 99999;
  padding: 0;
  margin: 0;
  animation: overlayIn 0.25s ease;
}

@keyframes overlayIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: #f2f2f6;
  border-radius: 28px 28px 0 0;
  width: 100%;
  max-height: 78vh;
  overflow-y: auto;
  position: relative;
  animation: sheetUp 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes sheetUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* 把手 */
.modal-handle {
  width: 36px;
  height: 5px;
  background: #c7c7cc;
  border-radius: 2.5px;
  margin: 10px auto 6px;
}

/* 大标题区 */
.modal-title-block {
  padding: 4px 20px 0;
}
.modal-subtitle {
  font-size: 11px;
  font-weight: 500;
  color: #8e8e93;
  margin: 0 0 1px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.modal-title {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
  letter-spacing: -0.3px;
}

.modal-body {
  padding: 12px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 警告 */
.modal-alert {
  font-size: 13px;
  color: #d97706;
  background: #fffbeb;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #fde68a;
  text-align: center;
}

/* 胶囊库存条 */
.stock-row {
  display: flex;
  gap: 8px;
}
.stock-pill {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 8px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.stock-label {
  font-size: 11px;
  font-weight: 500;
  color: #8e8e93;
}
.stock-value {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
  line-height: 1.1;
}
.stock-value.red {
  color: #ff3b30;
}
.stock-value.green {
  color: #34c759;
}
.stock-unit {
  font-size: 10px;
  color: #8e8e93;
  font-weight: 500;
}

/* 调整区 */
.adjust-block {
  background: #fff;
  border-radius: 12px;
  padding: 8px 12px;
}
.adjust-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #8e8e93;
  margin-bottom: 6px;
}
.adjust-to {
  font-size: 11px;
  font-weight: 600;
  color: #007aff;
  text-align: right;
  max-width: 55%;
  line-height: 1.2;
}
.adjust-to.red {
  color: #ff3b30;
}
.adjust-to.green {
  color: #34c759;
}

.adjust-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.adjust-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: #f0f0f5;
  color: #007aff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.12s;
  -webkit-tap-highlight-color: transparent;
}
.adjust-btn svg {
  width: 16px;
  height: 16px;
}
.adjust-btn:active:not(:disabled) {
  background: #e0e0e8;
  transform: scale(0.92);
}
.adjust-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.adjust-display {
  display: flex;
  align-items: baseline;
  gap: 2px;
  min-width: 48px;
  justify-content: center;
}
.adjust-number {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
  line-height: 1;
}
.adjust-unit {
  font-size: 12px;
  color: #8e8e93;
  font-weight: 500;
}

/* 主按钮 */
.modal-primary {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: #007aff;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.12s,
    opacity 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.modal-primary:active:not(:disabled) {
  transform: scale(0.97);
}
.modal-primary:disabled {
  background: #e0e0e0;
  color: #fff;
  cursor: not-allowed;
  transform: none;
}

/* 取消 */
.modal-dismiss {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #007aff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.modal-dismiss:active {
  opacity: 0.5;
}

@media (prefers-color-scheme: dark) {
  .modal-content {
    background: #1c1c1e;
  }
  .modal-title {
    color: #f2f2f7;
  }
  .stock-pill {
    background: #2c2c2e;
  }
  .stock-value {
    color: #f2f2f7;
  }
  .adjust-block {
    background: #2c2c2e;
  }
  .adjust-number {
    color: #f2f2f7;
  }
  .adjust-btn {
    background: #3a3a3c;
    color: #0a84ff;
  }
  .adjust-btn:active:not(:disabled) {
    background: #48484a;
  }
  .modal-primary {
    background: #0a84ff;
  }
  .modal-primary:disabled {
    background: #48484a;
    color: #8e8e93;
  }
  .modal-dismiss {
    color: #0a84ff;
  }
  .modal-alert {
    background: #2c2c1e;
    border-color: #5c4c1e;
    color: #fbbf24;
  }
}

/* 响应式 */
@media (max-width: 575px) {
  .status-grid {
    grid-template-columns: 1fr;
  }
  .mobile-full-width {
    grid-column: 1/-1;
  }
  .modal-content {
    border-radius: 28px 28px 0 0;
  }
}
@media (min-width: 768px) {
  .user-info {
    flex-direction: column;
  }
  .status-grid:not(.has-user-card) {
    grid-template-columns: repeat(3, 1fr);
  }
  .status-grid.has-user-card {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 575px) {
  .vip-status-text {
    font-size: 12px; /* 移动端缩小字体 */
    white-space: nowrap; /* 强制不换行 */
    overflow: hidden; /* 隐藏溢出文字 */
    text-overflow: ellipsis; /* 溢出显示省略号，更美观 */
  }

  /* 极小屏进一步紧凑化状态卡片和时间分配弹窗 */
  .status-card :deep(.cute-icon),
  .status-card :deep(svg),
  .status-card :deep(img) {
    width: 20px;
    height: 20px;
  }
  .status-card {
    max-height: 48px;
    padding: 8px 10px;
    gap: 8px;
    border-radius: 12px;
  }
  .status-text {
    font-size: 11px;
  }
  .status-grid {
    gap: 5px;
  }
  .top-title-bar {
    margin: 0 0 4px 0;
    gap: 3px;
  }
  .app-title {
    font-size: 15px;
  }
  .version-number {
    font-size: 10px;
  }
  .username-text {
    font-size: 12px;
  }
  .selected-user .user-name {
    font-size: 12px;
    max-width: 80px;
  }
}
</style>
