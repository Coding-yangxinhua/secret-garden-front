<template>
  <div class="login-config-card apple-card">
    <div class="apple-card-header">
      <cute-icon name="calendar-clock" size="20" color="#007AFF" />
      <span class="apple-card-title">启用配置</span>
      <van-count-down
        v-if="nextRunTime > 0"
        :time="nextRunTime"
        @finish="$emit('getConfig')"
        format="HH:mm:ss"
        class="apple-countdown"
      />
    </div>

    <div class="apple-card-content">
      <!-- 保持启用 -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">保持启用</div>
          <div class="apple-cell-label">
            {{
              currentUser.gameId == 1 || (currentUser.gameId == 2 && currentUser.userName == null)
                ? '开启后每次登录会自动开始挂机'
                : '开启后被挤号后会定时自动启动'
            }}
          </div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :disabled="!currentUser || currentUser.refreshNeed || !currentUser.subscribe"
            :model-value="innerLogin.relogin.status == 1"
            @update:model-value="onReloginChange"
            size="22"
          />
        </div>
      </div>

      <!-- 上号倒计时（子分区） -->
      <div
        v-show="
          innerLogin.relogin.status == 1 && currentUser.gameId == 2 && currentUser.userName != null
        "
        class="apple-sub-section apple-indent"
      >
        <div class="apple-sub-header">
          <van-icon name="setting-o" size="14" color="#86868B" />
          <span>计时设置</span>
        </div>
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">上号倒计时</div>
            <div class="apple-cell-label">被挤号后 N 分钟自动上号挂机</div>
          </div>
          <div class="apple-cell-right">
            <CustomArrayStepper
              v-model="innerLogin.relogin.waitingTime"
              :min="0"
              :step="5"
              :inputDisabled="false"
              class="apple-stepper-wrap"
              @change="syncParent"
            />
          </div>
        </div>
      </div>

      <!-- 循环上号 -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">循环上号（V1）</div>
          <div class="apple-cell-label">
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
          </div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :disabled="!currentUser || currentUser.refreshNeed || !currentUser.subscribe"
            :model-value="innerLogin.loop?.status == 1"
            @update:model-value="onLoopChange"
            size="22"
          />
        </div>
      </div>

      <!-- 循环上号设置（子分区） -->
      <div v-show="innerLogin.loop?.status == 1" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="setting-o" size="14" color="#86868B" />
          <span>循环上号设置</span>
        </div>
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">间隔时长</div>
            <div class="apple-cell-label">每隔多久自动上号（分钟）</div>
          </div>
          <div class="apple-cell-right">
            <CustomArrayStepper
              v-model="innerLogin.loop.interval"
              :min="1"
              :step="5"
              :inputDisabled="false"
              class="apple-stepper-wrap"
              @change="syncParent"
            />
          </div>
        </div>
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">上号时长</div>
            <div class="apple-cell-label">每次上号持续多久（分钟）</div>
          </div>
          <div class="apple-cell-right">
            <CustomArrayStepper
              v-model="innerLogin.loop.duration"
              :min="1"
              :step="5"
              :inputDisabled="false"
              class="apple-stepper-wrap"
              @change="syncParent"
            />
          </div>
        </div>
      </div>

      <!-- 定时上号 -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">定时上号（V1）</div>
          <div class="apple-cell-label">
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
          </div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :disabled="!currentUser || currentUser.refreshNeed || !currentUser.subscribe"
            :model-value="innerLogin.scheduled.status == 1"
            @update:model-value="onScheduledChange"
            size="22"
          />
        </div>
      </div>

      <!-- 定时上号时段列表 -->
      <div v-show="innerLogin.scheduled.status == 1" class="scheduled-section">
        <div class="apple-sub-header" style="margin-top: 4px">
          <van-icon name="clock-o" size="14" color="#86868B" />
          <span>定时上号时段</span>
        </div>

        <!-- 空状态 -->
        <div v-if="innerLogin.scheduled.times.length === 0" class="apple-empty">
          <div class="apple-empty-icon">
            <van-icon name="clock-o" size="40" color="#C7C7CC" />
          </div>
          <div class="apple-empty-text">暂无定时配置</div>
          <div class="apple-empty-desc">点击下方按钮添加定时时段</div>
        </div>

        <!-- 时间段行 -->
        <div v-for="(timeSlot, index) in innerLogin.scheduled.times" :key="index" class="apple-row">
          <div class="apple-row-item" style="flex: 0.4">
            <div class="apple-row-label">启用</div>
            <div class="apple-row-value" style="justify-content: center">
              <van-switch
                :model-value="timeSlot.status"
                @update:model-value="(val) => onTimeSlotStatusChange(index, val)"
                :active-value="1"
                :inactive-value="0"
                size="18"
              />
            </div>
          </div>

          <div class="apple-row-item clickable" @click="showTime(index, 'beginTime')">
            <div class="apple-row-label">开始</div>
            <div class="apple-row-value">
              <span>{{ formatTime(timeSlot.beginTime) }}</span>
              <van-icon name="arrow" size="12" color="#C7C7CC" />
            </div>
          </div>

          <div class="apple-row-item clickable" @click="showTime(index, 'endTime')">
            <div class="apple-row-label">结束</div>
            <div class="apple-row-value">
              <span>{{ formatTime(timeSlot.endTime) }}</span>
              <van-icon name="arrow" size="12" color="#C7C7CC" />
            </div>
          </div>

          <button class="apple-delete-btn" @click="deleteTimeSlot(index)">
            <van-icon name="delete-o" size="16" color="#FF3B30" />
          </button>
        </div>

        <button class="apple-add-btn" @click="addTimeSlot">
          <van-icon name="add-o" size="16" />
          <span>添加时间段</span>
        </button>
      </div>
    </div>

    <!-- 时间选择器 -->
    <TimePickerSheet v-model="showTimePicker" @confirm="confirmTime" />
  </div>
</template>

<script setup>
import { ref, watch, toRaw, onMounted, onUnmounted, reactive } from 'vue'
import CustomArrayStepper from '@/components/CustomArrayStepper.vue'
import TimePickerSheet from '@/components/TimePickerSheet.vue'

const props = defineProps({
  login: {
    type: Object,
    default: () => ({
      relogin: { status: 1, waitingTime: 100 },
      scheduled: { status: 1, times: [] },
      loop: { status: 0, interval: 60, duration: 10 },
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

const tickCountdown = () => {
  const tickOne = (val) => (val != null && val > 0 ? Math.max(0, val - 1000) : val)

  localScheduled.startRemainMs = tickOne(localScheduled.startRemainMs)
  localScheduled.endRemainMs = tickOne(localScheduled.endRemainMs)
  localLoop.startRemainMs = tickOne(localLoop.startRemainMs)
  localLoop.endRemainMs = tickOne(localLoop.endRemainMs)

  if (
    (localScheduled.startRemainMs != null && localScheduled.startRemainMs <= 0) ||
    (localScheduled.endRemainMs != null && localScheduled.endRemainMs <= 0) ||
    (localLoop.startRemainMs != null && localLoop.startRemainMs <= 0) ||
    (localLoop.endRemainMs != null && localLoop.endRemainMs <= 0)
  ) {
    emit('getConfig')
  }
}

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

const createDefaultLogin = () => ({
  relogin: { status: 1, waitingTime: 100 },
  scheduled: { status: 1, times: [] },
  loop: { status: 0, interval: 60, duration: 10 },
})

const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(toRaw(obj)))
  } catch (e) {
    return createDefaultLogin()
  }
}

const innerLogin = ref(deepClone(props.login) || createDefaultLogin())

watch(
  () => props.login,
  (newVal) => {
    innerLogin.value = deepClone(newVal) || createDefaultLogin()
  },
  { deep: true },
)

const syncParent = () => {
  emit('update:login', deepClone(innerLogin.value))
}

// 各字段修改处理
const onReloginChange = (val) => {
  innerLogin.value.relogin.status = val ? 1 : 0
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

const showTimePicker = ref(false)
const editingTimeIndex = ref(-1)
const editingTimeField = ref('beginTime')

const formatTime = (minutes) => {
  if (minutes == null) return '00:00'
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m}`
}

const confirmTime = (timestampMs) => {
  // TimePickerSheet 返回毫秒时间戳（从午夜开始），转为分钟
  const totalMinutes = Math.floor(timestampMs / 60000)
  const times = innerLogin.value.scheduled.times
  if (editingTimeIndex.value >= 0 && times[editingTimeIndex.value]) {
    times[editingTimeIndex.value][editingTimeField.value] = totalMinutes
    syncParent()
  }
}

const addTimeSlot = () => {
  innerLogin.value.scheduled.times.push({
    beginTime: 0,
    endTime: 1440,
    status: 1,
  })
  syncParent()
}

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

const showTime = (index, field) => {
  editingTimeIndex.value = index
  editingTimeField.value = field
  showTimePicker.value = true
}

const deleteTimeSlot = (index) => {
  innerLogin.value.scheduled.times.splice(index, 1)
  syncParent()
}
</script>

<style scoped>
/* ============================================================
   🔑 LoginConfig – iOS 17 Settings 风格
   与 PlantConfig 保持完全一致的样式体系
   ============================================================ */

/* 卡片容器：磨砂玻璃 + 圆角，与 PlantConfig 一致 */
.login-config-card {
  background: rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(32px) saturate(1.4);
  -webkit-backdrop-filter: blur(32px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 0 0 0.5px rgba(0, 0, 0, 0.02) inset;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 16px;
}

.login-config-card .apple-card-header {
  padding: 16px 16px 0;
}

.login-config-card .apple-card-content {
  padding: 4px 16px 12px;
}

/* 倒计时文字 */
.apple-countdown {
  font-size: 12px;
  font-weight: 500;
  color: #86868b;
  font-family: -apple-system, 'SF Pro Text', 'PingFang SC', sans-serif;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.1px;
}

/* CustomArrayStepper 宽度限制（与 PlantConfig 一致） */
.apple-stepper-wrap {
  width: 108px;
}

/* 定时上号 label 内的状态提示 */
.schedule-label-status {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 8px;
  margin-top: 1px;
}

.label-status-inner {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #6b6b70;
  line-height: 1.4;
}

.label-status-inner.muted {
  color: #aeaeb2;
}

/* 定时上号时段区块 */
.scheduled-section {
  margin-top: 8px;
}

/* 时间段行内的点击项 */
.clickable {
  cursor: pointer;
}

/* 覆盖 apple-row-item 以便点击整个区域 */
.apple-row-item:active {
  background: rgba(229, 229, 234, 0.7);
}

/* 超小屏适配 */
@media screen and (max-width: 350px) {
  .apple-stepper-wrap {
    width: 92px;
  }
}
</style>
