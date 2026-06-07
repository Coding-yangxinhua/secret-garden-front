<template>
  <div class="config-card main-switch-card">
    <div class="card-header">
      <span class="card-title">启用配置</span>
      <van-count-down
        v-if="nextRunTime > 0"
        :time="nextRunTime"
        @finish="$emit('getConfig')"
        format="距离自动上号还剩：HH 时 mm 分 ss 秒"
      />
    </div>

    <div class="card-content" v-show="expanded">
      <!-- 保持启用 -->
      <van-cell
        class="main-switch-cell"
        center
        title="保持启用"
        :label="
          currentUser.gameId == 1 || (currentUser.gameId == 2 && currentUser.userName == null)
            ? '开启后每次登录会自动开始挂机'
            : '开启后被挤号后会定时自动启动'
        "
      >
        <template #right-icon>
          <van-switch
            :disabled="!currentUser || currentUser.refreshNeed || !currentUser.subscribe"
            :model-value="innerLogin.relogin.status == 1"
            @update:model-value="onReloginChange"
            size="24"
            class="main-switch"
          />
        </template>
      </van-cell>

      <!-- 上号倒计时 -->
      <div
        v-show="
          innerLogin.relogin.status == 1 && currentUser.gameId == 2 && currentUser.userName != null
        "
        class="order-advanced-section"
      >
        <div class="indent">
          <div class="section-title">
            <van-icon name="setting-o" size="16" color="#8c8c8c" />
            <span>计时设置</span>
          </div>
          <van-cell class="advanced-cell" title="上号倒计时" label="被挤号后 N 分钟自动上号挂机">
            <van-stepper
              :model-value="innerLogin.relogin.waitingTime"
              @update:model-value="onWaitingTimeChange"
              step="5"
              integer
              min="0"
              theme="round"
              button-size="24px"
              class="stepper-control"
            />
          </van-cell>
        </div>
      </div>

      <!-- 循环上号 -->
      <van-cell class="main-switch-cell" center title="循环上号（V1）">
        <template #label>
          <div
            v-if="innerLogin.loop?.status == 1 && scheduleTimeInfo"
            class="schedule-label-status"
          >
            <span
              v-if="
                localLoop.startRemainMs != null &&
                localLoop.startRemainMs > 0 &&
                localLoop.endRemainMs == null
              "
              class="label-status-inner"
              style="color: #faad14"
            >
              <van-icon name="fire-o" size="14" /> 下次上号
              {{ formatRemain(localLoop.startRemainMs) }}
            </span>
            <span
              v-if="localLoop.endRemainMs != null && localLoop.endRemainMs > 0"
              class="label-status-inner"
              style="color: #ff4d4f"
            >
              <van-icon name="poweroff" size="14" /> 下次下号
              {{ formatRemain(localLoop.endRemainMs) }}
            </span>
            <span
              v-if="localLoop.startRemainMs == null && localLoop.endRemainMs == null"
              class="label-status-inner muted"
            >
              <van-icon name="info-o" size="14" /> 暂无活跃循环
            </span>
          </div>
          <div v-else class="schedule-label-status">
            <span class="label-status-inner muted">
              <van-icon name="info-o" size="14" /> 每隔一段时间自动上号一段时间
            </span>
          </div>
        </template>
        <template #right-icon>
          <van-switch
            :disabled="!currentUser || currentUser.refreshNeed || !currentUser.subscribe"
            :model-value="innerLogin.loop?.status == 1"
            @update:model-value="onLoopChange"
            size="24"
            class="main-switch"
          />
        </template>
      </van-cell>
      <div v-show="innerLogin.loop?.status == 1" class="order-advanced-section">
        <div class="indent">
          <div class="section-title">
            <van-icon name="setting-o" size="16" color="#8c8c8c" />
            <span>循环上号设置</span>
          </div>
          <!-- 循环状态提示 -->
          <!-- 已移至上方 van-cell label 区域 -->
          <van-cell class="advanced-cell" title="间隔时长" label="每隔多久自动上号（分钟）">
            <van-stepper
              :model-value="innerLogin.loop?.interval"
              @update:model-value="onLoopIntervalChange"
              step="5"
              integer
              min="1"
              theme="round"
              button-size="24px"
              class="stepper-control"
            />
          </van-cell>
          <van-cell class="advanced-cell" title="上号时长" label="每次上号持续多久（分钟）">
            <van-stepper
              :model-value="innerLogin.loop?.duration"
              @update:model-value="onLoopDurationChange"
              step="5"
              integer
              min="1"
              theme="round"
              button-size="24px"
              class="stepper-control"
            />
          </van-cell>
        </div>
      </div>

      <!-- 定时上号 -->
      <van-cell class="main-switch-cell" center title="定时上号（V1）">
        <template #label>
          <!-- 定时状态实时提示 -->
          <div
            v-if="innerLogin.scheduled.status == 1 && scheduleTimeInfo"
            class="schedule-label-status"
          >
            <span
              v-if="
                localScheduled.inScheduledPeriod &&
                localScheduled.endRemainMs != null &&
                localScheduled.endRemainMs > 0
              "
              class="label-status-inner"
              style="color: #52c41a"
            >
              <van-icon name="success" size="14" /> 当前在定时时段内
            </span>
            <span
              v-if="
                localScheduled.inScheduledPeriod &&
                localScheduled.endRemainMs != null &&
                localScheduled.endRemainMs > 0
              "
              class="label-status-inner"
              style="color: #faad14"
            >
              <van-icon name="clock-o" size="14" /> 定时结束
              {{ formatRemain(localScheduled.endRemainMs) }}
            </span>
            <span
              v-if="
                localScheduled.inScheduledPeriod &&
                (localScheduled.endRemainMs == null || localScheduled.endRemainMs <= 0) &&
                localScheduled.startRemainMs != null &&
                localScheduled.startRemainMs > 0
              "
              class="label-status-inner"
              style="color: #ff4d4f"
            >
              <van-icon name="pause-circle-o" size="14" /> 用户手动停止，下次上号
              {{ formatRemain(localScheduled.startRemainMs) }}
            </span>
            <span v-if="!localScheduled.inScheduledPeriod" class="label-status-inner muted">
              <van-icon name="pause-circle-o" size="14" /> 当前不在定时时段
            </span>
            <span
              v-if="
                !localScheduled.inScheduledPeriod &&
                localScheduled.startRemainMs != null &&
                localScheduled.startRemainMs > 0
              "
              class="label-status-inner"
              style="color: #1890ff"
            >
              <van-icon name="clock-o" size="14" /> 下次上号
              {{ formatRemain(localScheduled.startRemainMs) }}
            </span>
            <span
              v-if="
                localScheduled.startRemainMs == null &&
                localScheduled.endRemainMs == null &&
                !localScheduled.inScheduledPeriod
              "
              class="label-status-inner muted"
            >
              <van-icon name="info-o" size="14" /> 暂无可用的定时计划，开启后可配置定时上号时间段
            </span>
          </div>
          <div v-else class="schedule-label-status">
            <span class="label-status-inner muted">
              <van-icon name="info-o" size="14" /> 开启后可配置定时上号时间段
            </span>
          </div>
        </template>
        <template #right-icon>
          <van-switch
            :disabled="!currentUser || currentUser.refreshNeed || !currentUser.subscribe"
            :model-value="innerLogin.scheduled.status == 1"
            @update:model-value="onScheduledChange"
            size="24"
            class="main-switch"
          />
        </template>
      </van-cell>

      <!-- 时间段列表 -->
      <div v-show="innerLogin.scheduled.status == 1" class="scheduled-section">
        <div class="section-title">
          <van-icon name="clock-o" size="16" color="#8c8c8c" />
          <span>定时上号时段</span>
        </div>

        <div v-if="innerLogin.scheduled.times.length === 0" class="empty-state">
          <van-empty description="暂无定时配置，点击添加按钮创建" class="empty-content" />
        </div>

        <div
          v-for="(timeSlot, index) in innerLogin.scheduled.times"
          :key="index"
          class="time-slot-row"
        >
          <van-switch
            :model-value="timeSlot.status"
            @update:model-value="(val) => onTimeSlotStatusChange(index, val)"
            :active-value="1"
            :inactive-value="0"
            size="20"
            class="slot-switch"
          />

          <div class="slot-time clickable" @click="showTime(index, 'beginTime')">
            <span class="slot-time-label">开始</span>
            <span class="slot-time-value">{{ formatTime(timeSlot.beginTime) }}</span>
          </div>

          <span class="time-separator">—</span>

          <div class="slot-time clickable" @click="showTime(index, 'endTime')">
            <span class="slot-time-label">结束</span>
            <span class="slot-time-value">{{ formatTime(timeSlot.endTime) }}</span>
          </div>

          <van-button
            class="delete-button"
            icon="delete-o"
            size="mini"
            type="danger"
            plain
            @click="deleteTimeSlot(index)"
          />
        </div>

        <van-button class="add-button" block type="primary" icon="add-o" @click="addTimeSlot">
          添加时间段
        </van-button>
      </div>
    </div>

    <!-- 时间选择器 -->
    <van-popup v-model:show="showTimePicker" round position="bottom" class="custom-popup">
      <div class="popup-header">
        <span class="popup-title">选择时间</span>
      </div>
      <van-time-picker :formatter="formatter" @confirm="confirmTime" class="custom-time-picker" />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, watch, toRaw, onMounted, onUnmounted, reactive } from 'vue'

const props = defineProps({
  login: {
    type: Object,
    default: () => ({
      relogin: { status: 1, waitingTime: 100 },
      scheduled: { status: 1, times: [] },
      loop: { status: 0, interval: 60, duration: 10 }, // 新增默认
    }),
  },
  currentUser: {
    type: Object,
    required: true,
  },
  nextRunTime: {
    type: Number,
    default: 0,
  },
  scheduleTimeInfo: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:login', 'getConfig'])

// ---------- 实时倒计时状态 ----------
// 局部实时倒计时（每秒更新），从 scheduleTimeInfo prop 同步过来
const localScheduled = reactive({
  inScheduledPeriod: false,
  startRemainMs: null,
  endRemainMs: null,
})

const localLoop = reactive({
  startRemainMs: null,
  endRemainMs: null,
})

let countdownTimer = null

// 从 props 同步倒计时值到本地
const syncCountdownFromProps = () => {
  const info = props.scheduleTimeInfo
  if (!info) {
    localScheduled.inScheduledPeriod = false
    localScheduled.startRemainMs = null
    localScheduled.endRemainMs = null
    localLoop.startRemainMs = null
    localLoop.endRemainMs = null
    return
  }
  const toNum = (v) => (v == null ? null : Math.max(0, Number(v)))
  localScheduled.inScheduledPeriod = !!info.inScheduledPeriod
  localScheduled.startRemainMs = toNum(info.scheduledStartRemain)
  localScheduled.endRemainMs = toNum(info.scheduledEndRemain)
  localLoop.startRemainMs = toNum(info.loopStartRemain)
  localLoop.endRemainMs = toNum(info.loopEndRemain)
}

// 每秒减 1000ms
const tickCountdown = () => {
  const tickOne = (val) => (val != null && val > 0 ? Math.max(0, val - 1000) : val)

  localScheduled.startRemainMs = tickOne(localScheduled.startRemainMs)
  localScheduled.endRemainMs = tickOne(localScheduled.endRemainMs)
  localLoop.startRemainMs = tickOne(localLoop.startRemainMs)
  localLoop.endRemainMs = tickOne(localLoop.endRemainMs)

  // 如果有任何一个倒计时归零，触发刷新
  if (
    (localScheduled.startRemainMs != null && localScheduled.startRemainMs <= 0) ||
    (localScheduled.endRemainMs != null && localScheduled.endRemainMs <= 0) ||
    (localLoop.startRemainMs != null && localLoop.startRemainMs <= 0) ||
    (localLoop.endRemainMs != null && localLoop.endRemainMs <= 0)
  ) {
    emit('getConfig')
  }
}

// 监听 scheduleTimeInfo prop 变化，重新同步
watch(
  () => props.scheduleTimeInfo,
  () => {
    syncCountdownFromProps()
  },
  { deep: true, immediate: true },
)

onMounted(() => {
  syncCountdownFromProps()
  countdownTimer = setInterval(tickCountdown, 1000)
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
// ---------- 实时倒计时状态结束 ----------

// 生成默认登录配置
const createDefaultLogin = () => ({
  relogin: { status: 1, waitingTime: 100 },
  scheduled: { status: 1, times: [] },
  loop: { status: 0, interval: 60, duration: 10 }, // 新增默认
})

// 安全的深拷贝函数（只适合简单数据，不包含函数/循环引用）
const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(toRaw(obj)))
  } catch (e) {
    // 若克隆失败，返回一个全新的默认对象作为兜底
    return createDefaultLogin()
  }
}

// 内部响应式拷贝，初始值从 prop 获取
const innerLogin = ref(deepClone(props.login) || createDefaultLogin())

// 同步外部 prop 到内部
watch(
  () => props.login,
  (newVal) => {
    innerLogin.value = deepClone(newVal) || createDefaultLogin()
  },
  { deep: true },
)

// 通知父组件更新
const syncParent = () => {
  // emit 时也发送一个普通对象的克隆，避免响应式泄漏
  emit('update:login', deepClone(innerLogin.value))
}

// 各字段修改处理（保持不变）
const onReloginChange = (val) => {
  innerLogin.value.relogin.status = val ? 1 : 0
  syncParent()
}
const onWaitingTimeChange = (val) => {
  innerLogin.value.relogin.waitingTime = val
  syncParent()
}
const onScheduledChange = (val) => {
  innerLogin.value.scheduled.status = val ? 1 : 0
  syncParent()
}
const onTimeSlotStatusChange = (index, val) => {
  innerLogin.value.scheduled.times[index].status = val
  syncParent()
}
const onLoopChange = (val) => {
  if (!innerLogin.value.loop) innerLogin.value.loop = { status: 0, interval: 60, duration: 10 }
  innerLogin.value.loop.status = val ? 1 : 0
  syncParent()
}
const onLoopIntervalChange = (val) => {
  if (!innerLogin.value.loop) innerLogin.value.loop = { status: 1, interval: 60, duration: 10 }
  innerLogin.value.loop.interval = val
  syncParent()
}
const onLoopDurationChange = (val) => {
  if (!innerLogin.value.loop) innerLogin.value.loop = { status: 1, interval: 60, duration: 10 }
  innerLogin.value.loop.duration = val
  syncParent()
}

// 时间选择器相关（不变）
const showTimePicker = ref(false)
const editingTimeIndex = ref(-1)
const editingTimeField = ref('beginTime')

// 时间转换：分钟数 → HH:mm
const formatTime = (minutes) => {
  if (minutes == null) return '00:00'
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m}`
}

// 选择器确认：将 [hour, minute] → 总分钟数
const confirmTime = ({ selectedValues }) => {
  const [h, m] = selectedValues.map(Number)
  const totalMinutes = h * 60 + m
  const times = innerLogin.value.scheduled.times
  if (editingTimeIndex.value >= 0 && times[editingTimeIndex.value]) {
    times[editingTimeIndex.value][editingTimeField.value] = totalMinutes
    syncParent()
  }
  showTimePicker.value = false
}

// 新增时间段默认值（0 分钟 – 1440 分钟，即全天）
const addTimeSlot = () => {
  innerLogin.value.scheduled.times.push({
    beginTime: 0,
    endTime: 1440, // 24 * 60
    status: 1,
  })
  syncParent()
}

// 毫秒数 → 可读的倒计时文本（已确保传入的是数字）
const formatRemain = (ms) => {
  if (ms == null) return ''
  if (ms <= 0) return '即将开始'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h} 时 ${m} 分 ${s} 秒`
  if (m > 0) return `${m} 分 ${s} 秒`
  return `${s} 秒`
}

const formatter = (type, option) => {
  if (type === 'hour') option.text += '时'
  if (type === 'minute') option.text += '分'
  return option
}

const showTime = (index, field) => {
  editingTimeIndex.value = index
  editingTimeField.value = field
  showTimePicker.value = true
}

const deleteTimeSlot = (index) => {
  innerLogin.value.scheduled.times.splice(index, 1)
  syncParent()
}

const expanded = ref(true)
</script>

<style scoped>
/* 卡片基础样式 */
.config-card {
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 15px;
  border: 1px solid #e6f7ff;
  animation: fadeIn 0.3s ease-out;
}

.card-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #f5f5f5;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
}

.card-content {
  padding: 16px 20px;
}

/* 开关行 */
.main-switch-cell {
  background-color: transparent;
  padding: 8px 0;
}

.main-switch {
  --van-switch-active-color: #1890ff;
}

/* 定时上号 label 内的状态提示 */
.schedule-label-status {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin-top: 2px;
}

.label-status-inner {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #555;
  line-height: 1.5;
}

.label-status-inner.muted {
  color: #bbb;
}

/* 上号倒计时区域 */
.order-advanced-section {
  margin-top: 12px;
}

.scheduled-section {
  margin-top: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 10px;
}

/* 状态提示 */
.status-hint {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  padding: 8px 0 4px 0;
  margin-bottom: 4px;
}

.status-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #555;
  line-height: 1.4;
}

.status-item.muted {
  color: #bbb;
}

/* 缩进样式 */
.indent {
  position: relative;
  padding-left: 14px;
  margin-left: 4px;
}
.indent::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    #eaeaea 0px,
    #eaeaea 6px,
    transparent 6px,
    transparent 12px
  );
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
}

/* 高级设置项 */
.advanced-cell {
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.stepper-control {
  width: auto;
}

/* 时间段行 — 移动端单行紧凑布局 */
.time-slot-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: nowrap; /* 禁止换行 */
}

.slot-switch {
  flex-shrink: 0;
}

/* 时间胶囊 */
.slot-time {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 2px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.slot-time:active {
  background: #e8ecf1;
}

.slot-time-label {
  font-size: 10px;
  color: #999;
  line-height: 1.2;
}

.slot-time-value {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  line-height: 1.3;
  margin-top: 1px;
}

.time-separator {
  font-size: 12px;
  color: #ccc;
  flex-shrink: 0;
}

/* 删除按钮 */
.delete-button {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
}

.add-button {
  margin-top: 12px;
  border-radius: 12px;
  height: 44px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.empty-state {
  padding: 20px 0;
  display: flex;
  justify-content: center;
}

/* 时间选择器弹窗 */
.custom-popup {
  border-radius: 20px 20px 0 0;
}

.popup-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
}

.custom-time-picker {
  padding: 0 20px 20px;
}

/* 超小屏适配 */
@media screen and (max-width: 350px) {
  .time-slot-row {
    gap: 4px;
    padding: 6px 0;
  }

  .slot-time {
    padding: 3px 1px;
    border-radius: 6px;
  }

  .slot-time-label {
    font-size: 9px;
  }

  .slot-time-value {
    font-size: 11px;
  }

  .delete-button {
    width: 26px;
    height: 26px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
