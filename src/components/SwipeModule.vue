<template>
  <div>
    <!-- 模块指示器圆点 (iOS 17 小圆点) -->
    <div class="swipe-indicator" v-if="moduleList.length > 1">
      <span
        v-for="(m, i) in moduleList"
        :key="m.key"
        class="swipe-dot"
        :class="{ active: currentIndex === i }"
        @click="swipeToModule(i)"
      ></span>
    </div>

    <!-- 滑动容器 -->
    <div
      class="swipe-area"
      ref="swipeAreaRef"
      @touchstart="onSwipeTouchStart"
      @touchmove="onSwipeTouchMove"
      @touchend="onSwipeTouchEnd"
      @touchcancel="onSwipeTouchEnd"
    >
      <div
        class="swipe-track"
        ref="swipeTrackRef"
        :class="{
          'swipe-animating': isAnimating,
          'swipe-track-vertical': !isHorizontal,
        }"
        :style="trackStyle"
      >
        <div
          v-for="(m, i) in moduleList"
          :key="m.key"
          class="swipe-page"
          :class="{ 'swipe-page-vertical': !isHorizontal }"
          :data-page-key="m.key"
          :ref="(el) => setPageRef(el, m.key)"
        >
          <slot :name="m.key" :module="m" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: 'enable' },
  direction: { type: String, default: 'horizontal' }, // 'horizontal' | 'vertical'
  gameId: { type: Number, default: 1 },
  moduleDefs: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'update:direction'])

// ========== 核心状态 ==========
const swipeAreaRef = ref(null)
const swipeTrackRef = ref(null)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchOffsetX = ref(0)
const isSwiping = ref(false)
const isHorizontalSwipe = ref(false)
const isAnimating = ref(false)

// --- iOS 风格滑动参数 ---
const RUBBER_BAND_FACTOR = 0.25 // 弹性边界阻尼系数
const SWIPE_THRESHOLD_RATIO = 0.18 // 滑动超过 18% 宽度即切换
const VELOCITY_SAMPLE_RATE = 16 // 每 16ms 采一次样（60fps）
const VELOCITY_THRESHOLD = 0.12 // 像素/毫秒阈值，极低即可触发
const ANIM_DURATION_MS = 360 // 动画时长
const ANIM_DURATION_SNAP_MS = 260 // 回弹动画时长

// --- 速度/动量检测 ---
const velocitySamples = []
const VELOCITY_SAMPLE_COUNT = 4 // 采样4个点平滑
let lastMoveTime = 0
// 垂直模式特有状态
// 注：垂直模式下不做触摸切换干预，完全交由浏览器原生滚动

// 计算顶部 sticky 元素的总高度（UserStatusCard + swipe-indicator 等）
function getStickyTopOffset() {
  let top = 0
  const fixedCard = document.querySelector('.fixed-top-card')
  if (fixedCard) top += fixedCard.offsetHeight || 0
  const indicator = document.querySelector('.swipe-indicator')
  if (indicator) top += indicator.offsetHeight || 0
  // 加上一些额外间距
  top += 8
  return top
}

// 垂直模式滚动到目标模块，精确计算偏移，避开 sticky 顶部遮挡
function scrollToModule(index) {
  const pages = swipeAreaRef.value?.querySelectorAll('.swipe-page')
  const target = pages?.[index]
  if (!target) return
  isAnimating.value = true

  // 获取目标元素相对于文档顶部的偏移
  const targetRect = target.getBoundingClientRect()
  const scrollY = window.scrollY || window.pageYOffset
  const stickyTop = getStickyTopOffset()

  // 目标位置 = 文档中的绝对位置 - sticky 顶部高度
  const targetPosition = targetRect.top + scrollY - stickyTop

  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  })

  setTimeout(() => {
    isAnimating.value = false
  }, 400)
}

// ========== computed ==========
const moduleList = computed(() => {
  if (!props.gameId) return []
  return props.moduleDefs.filter((m) => m.gameId.includes(props.gameId))
})

const currentIndex = computed(() => {
  const idx = moduleList.value.findIndex((m) => m.key === props.modelValue)
  return idx >= 0 ? idx : 0
})

const isHorizontal = computed(() => props.direction === 'horizontal')

// 垂直模式下 track 样式改变布局
const trackStyle = computed(() => {
  if (isHorizontal.value) return {}
  return {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    width: '100%',
  }
})

// ========== 速度记录（iOS 风格加权采样） ==========
function recordVelocity(dx, now) {
  // 控制采样率，避免高频噪声
  const dt = now - lastMoveTime
  if (dt < VELOCITY_SAMPLE_RATE) return
  const v = dt > 0 ? dx / dt : 0
  velocitySamples.push(v)
  if (velocitySamples.length > VELOCITY_SAMPLE_COUNT) {
    velocitySamples.shift()
  }
  lastMoveTime = now
}

function calcVelocity() {
  if (velocitySamples.length === 0) return 0
  // 加权平均：越新的采样权重越大
  let sum = 0
  let totalWeight = 0
  velocitySamples.forEach((v, i) => {
    const w = (i + 1) / velocitySamples.length
    sum += v * w
    totalWeight += w
  })
  return totalWeight > 0 ? sum / totalWeight : 0
}

// ========== 触摸事件（iOS 风格） ==========
function onSwipeTouchStart(e) {
  if (isAnimating.value) return
  const touch = e.changedTouches?.[0] || e.touches?.[0] || e
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  touchOffsetX.value = 0
  isSwiping.value = true
  isHorizontalSwipe.value = false
  velocitySamples.length = 0
  lastMoveTime = performance.now()
}

function onSwipeTouchMove(e) {
  if (!isSwiping.value || isAnimating.value) return

  if (isHorizontal.value) {
    handleHorizontalMove(e)
  }
  // 垂直模式：完全交由浏览器原生处理滚动，不做任何干预
}

function rubberBand(offset, limit) {
  // iOS 风格的橡皮筋效果: y = (1 - (1 / (|x|/limit + 1))) * sign(x) * limit
  const abs = Math.abs(offset)
  if (abs <= limit) return offset
  const sign = offset > 0 ? 1 : -1
  return sign * (1 - 1 / (abs / limit + 1)) * limit * 1.2
}

function handleHorizontalMove(e) {
  const touch = e.changedTouches?.[0] || e.touches?.[0] || e
  const dx = touch.clientX - touchStartX.value
  const dy = touch.clientY - touchStartY.value

  // 方向锁定：用角度判断，更宽容斜滑
  if (!isHorizontalSwipe.value) {
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    const total = absDx + absDy
    if (total > 10) {
      const angle = absDx / total
      if (angle > 0.5) {
        // 水平占主导 → 锁定水平
        isHorizontalSwipe.value = true
      } else {
        // 垂直占主导 → 放弃触摸，让浏览器处理垂直滚动
        isSwiping.value = false
        touchOffsetX.value = 0
        return
      }
    }
  }
  if (!isHorizontalSwipe.value) return

  e.preventDefault()

  const idx = currentIndex.value
  const list = moduleList.value
  const areaWidth = swipeAreaRef.value?.offsetWidth || window.innerWidth

  // 计算原始偏移
  let rawOffset = -idx * areaWidth + dx

  // 首/末页边界做橡胶带弹性效果
  if ((idx === 0 && dx > 0) || (idx === list.length - 1 && dx < 0)) {
    const baseX = -idx * areaWidth
    const overScroll = dx
    const banded = rubberBand(overScroll, areaWidth * 0.25)
    rawOffset = baseX + banded
  }

  touchOffsetX.value = dx

  // 直接用 px 设置 transform，避免百分比计算精度问题
  const track = swipeTrackRef.value
  if (track) {
    track.style.transform = `translateX(${rawOffset}px)`
  }

  recordVelocity(dx, performance.now())
}

function onSwipeTouchEnd(e) {
  if (!isSwiping.value) return
  isSwiping.value = false

  if (isHorizontal.value) {
    handleHorizontalEnd()
  }
  // 垂直模式：不做任何切换判断，页面已由浏览器原生滚动到自然位置
}

function handleHorizontalEnd() {
  const idx = currentIndex.value
  const list = moduleList.value
  const areaWidth = swipeAreaRef.value?.offsetWidth || window.innerWidth
  const offset = touchOffsetX.value
  const absOffset = Math.abs(offset)

  const velocity = calcVelocity()
  const absVelocity = Math.abs(velocity)

  // 决定目标页面
  let targetIndex = idx
  let thresholdPassed = false

  // 条件1：快速滑动（速度优先）
  if (absVelocity > VELOCITY_THRESHOLD) {
    if (velocity < 0 && idx < list.length - 1) {
      targetIndex = idx + 1
      thresholdPassed = true
    } else if (velocity > 0 && idx > 0) {
      targetIndex = idx - 1
      thresholdPassed = true
    }
  }

  // 条件2：超过阈值（距离优先）
  if (!thresholdPassed) {
    const threshold = Math.max(SWIPE_THRESHOLD_RATIO * areaWidth, 30)
    if (absOffset > threshold) {
      if (offset < 0 && idx < list.length - 1) {
        targetIndex = idx + 1
        thresholdPassed = true
      } else if (offset > 0 && idx > 0) {
        targetIndex = idx - 1
        thresholdPassed = true
      }
    }
  }

  // 如果快速滑动的方向上有足够的距离走到了下一格，但偏移不够，用速度决定
  if (!thresholdPassed && absVelocity > VELOCITY_THRESHOLD * 2) {
    if (velocity < 0 && idx < list.length - 1) {
      targetIndex = idx + 1
      thresholdPassed = true
    } else if (velocity > 0 && idx > 0) {
      targetIndex = idx - 1
      thresholdPassed = true
    }
  }

  // 根据即将到达的位置计算目标偏移
  const targetOffsetPx = -targetIndex * areaWidth
  const currentPx = -idx * areaWidth + offset

  isHorizontalSwipe.value = false
  velocitySamples.length = 0

  if (targetIndex !== idx) {
    // 切换到新模块
    isAnimating.value = true
    const targetModule = list[targetIndex]
    emit('update:modelValue', targetModule.key)

    const track = swipeTrackRef.value
    if (track) {
      // 计算从当前位置到目标的剩余距离，根据距离自适应动画时长
      const remaining = Math.abs(targetOffsetPx - currentPx) / areaWidth
      const duration = 280 + remaining * 120

      track.style.transition = `transform ${duration}ms cubic-bezier(0.2, 0.9, 0.3, 1.1)`
      track.style.transform = `translateX(${targetOffsetPx}px)`
    }

    setTimeout(() => {
      if (track) track.style.transition = ''
      isAnimating.value = false
    }, 400)
  } else {
    // 回弹到当前页
    const track = swipeTrackRef.value
    if (track) {
      const remaining = Math.abs(targetOffsetPx - currentPx) / areaWidth
      const duration = 200 + remaining * 100

      track.style.transition = `transform ${duration}ms cubic-bezier(0.2, 0.85, 0.3, 1.0)`
      track.style.transform = `translateX(${targetOffsetPx}px)`
    }
    setTimeout(() => {
      if (track) track.style.transition = ''
    }, 300)
  }
}

// 点击指示器圆点跳转
function swipeToModule(index) {
  const module = moduleList.value[index]
  if (!module || isAnimating.value || index === currentIndex.value) return
  isAnimating.value = true
  emit('update:modelValue', module.key)
  touchOffsetX.value = 0

  if (isHorizontal.value) {
    const track = swipeTrackRef.value
    const areaWidth = swipeAreaRef.value?.offsetWidth || window.innerWidth
    if (track) {
      track.style.transition = `transform ${ANIM_DURATION_MS}ms cubic-bezier(0.2, 0.9, 0.3, 1.1)`
      track.style.transform = `translateX(${-index * areaWidth}px)`
      setTimeout(() => {
        track.style.transition = ''
        isAnimating.value = false
      }, ANIM_DURATION_MS + 40)
    } else {
      isAnimating.value = false
    }
  } else {
    // 垂直模式：圆点切换，由 scrollToModule 统一处理滚动和 isAnimating
    nextTick(() => {
      const idx = currentIndex.value
      scrollToModule(idx)
    })
  }
}

// ========== 动态高度 ==========
const pageRefMap = {}
let resizeObserver = null
let heightUpdatePending = false

function setPageRef(el, key) {
  if (el) {
    pageRefMap[key] = el
  }
}

function calcFinalHeight(el) {
  const contentHeight = el.scrollHeight
  let topOffset = 56
  const fixedCard = document.querySelector('.fixed-top-card')
  if (fixedCard) topOffset += fixedCard.offsetHeight || 0
  const indicator = document.querySelector('.swipe-indicator')
  if (indicator) topOffset += indicator.offsetHeight || 0
  topOffset += 120
  const minHeight = Math.max(200, window.innerHeight - topOffset)
  return Math.max(contentHeight, minHeight)
}

function applySwipeAreaStyle(height) {
  const el = swipeAreaRef.value
  if (!el) return
  if (height > 0) {
    el.style.minHeight = height + 'px'
    el.style.height = 'auto'
  } else {
    el.style.minHeight = '200px'
    el.style.height = 'auto'
  }
}

function updateSwipeAreaHeight(animated = false) {
  if (heightUpdatePending) return
  heightUpdatePending = true
  requestAnimationFrame(() => {
    heightUpdatePending = false
    const currentKey = props.modelValue
    const el = pageRefMap[currentKey]
    if (el) {
      const h = calcFinalHeight(el)
      applySwipeAreaStyle(h)
    }
    syncTrackPosition()
  })
}

function syncTrackPosition() {
  if (!isHorizontal.value) return
  const track = swipeTrackRef.value
  if (!track) return
  const idx = currentIndex.value
  const areaWidth = swipeAreaRef.value?.offsetWidth || window.innerWidth
  if (!isSwiping.value && !isAnimating.value) {
    track.style.transition = 'none'
    track.style.transform = `translateX(${-idx * areaWidth}px)`
  }
}

function observeCurrentPage() {
  if (resizeObserver) resizeObserver.disconnect()
  resizeObserver = new ResizeObserver(() => {
    if (isSwiping.value || isAnimating.value) return
    updateSwipeAreaHeight(true)
  })
  const currentKey = props.modelValue
  const el = pageRefMap[currentKey]
  if (el) {
    resizeObserver.observe(el)
  }
}

function onWindowResize() {
  if (!isHorizontal.value) return
  updateSwipeAreaHeight(false)
  const track = swipeTrackRef.value
  if (track) {
    const idx = currentIndex.value
    const areaWidth = swipeAreaRef.value?.offsetWidth || window.innerWidth
    track.style.transition = 'none'
    track.style.transform = `translateX(${-idx * areaWidth}px)`
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        track.style.transition = ''
      })
    })
  }
}

// ========== Watch ==========
watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    console.log(
      '[SwipeModule] modelValue changed:',
      oldVal,
      '->',
      newVal,
      'isHorizontal:',
      isHorizontal.value,
    )

    if (!isHorizontal.value) {
      // 垂直模式：滚动到目标模块位置，scrollToModule 内部会控制 isAnimating
      heightUpdatePending = false
      nextTick(() => {
        const idx = currentIndex.value
        scrollToModule(idx)
      })
      return
    }

    // 水平模式：清除动画状态，确保外部切换能立即生效
    isAnimating.value = false
    heightUpdatePending = false
    const fallbackH = Math.max(200, window.innerHeight - 200)
    applySwipeAreaStyle(fallbackH)
    // 立即同步轨道位置
    const track = swipeTrackRef.value
    if (track) {
      track.style.transition = 'none'
      const idx = currentIndex.value
      const areaWidth = swipeAreaRef.value?.offsetWidth || window.innerWidth
      track.style.transform = `translateX(${-idx * areaWidth}px)`
      console.log(
        '[SwipeModule] track synced to index:',
        idx,
        'transform:',
        `translateX(${-idx * areaWidth}px)`,
      )
    } else {
      console.warn('[SwipeModule] track ref is null')
    }
    nextTick(() => {
      updateSwipeAreaHeight(false)
      observeCurrentPage()
    })
  },
)

// ========== Lifecycle ==========
onMounted(() => {
  nextTick(() => {
    updateSwipeAreaHeight(false)
    observeCurrentPage()
  })
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<style scoped>
/* ============================================================
   🍎 iOS 17 卡片式横向分页滑动
   ============================================================ */

/* 滑动容器 */
.swipe-area {
  margin-top: 4px;
  touch-action: pan-y pinch-zoom;
  overflow: visible;
  position: relative;
  width: 100%;
}

/* 轨道 — 水平排列所有页面 */
.swipe-track {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;
  width: auto;
  will-change: transform;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  contain: layout style;
}

/* 垂直模式：轨道占满宽度，不应用 transform */
.swipe-track-vertical {
  width: 100% !important;
  transform: none !important;
  -webkit-transform: none !important;
}

/* 动画进行中：动态 transition 由 JS 注入 */

/* 每个页面占满 100% 宽度（水平模式） */
.swipe-page {
  flex: 0 0 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  padding: 0 8px;
}

/* 垂直模式：宽度占满父容器，不应用横向 flex 约束 */
.swipe-page-vertical {
  flex: none;
  width: 100%;
}

/* 指示器圆点 (iOS 17 风格) */
.swipe-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 8px 16px 4px;
}

.swipe-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #dccec7;
  cursor: pointer;
  transition: all 0.3s ease;
}

.swipe-dot.active {
  width: 18px;
  border-radius: 3px;
  background: linear-gradient(90deg, #c08ca8, #d4a0b8);
  box-shadow: 0 1px 4px rgba(180, 120, 140, 0.3);
}

.swipe-dot:hover {
  background: #c4a8b4;
}

.swipe-dot.active:hover {
  background: linear-gradient(90deg, #c08ca8, #d4a0b8);
}
</style>
