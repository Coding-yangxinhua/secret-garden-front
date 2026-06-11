<template>
  <!-- 🍎 入口按钮（iOS 17 磨砂圆形） -->
  <div
    ref="fabRef"
    class="module-fab"
    :class="edgeClass"
    :style="fabStyle"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <div class="fab-icon-wrap" v-if="!isLeftEdge && !isRightEdge && !isTopEdge && !isBottomEdge">
      <cute-icon :name="currentModuleIcon" size="20" color="#c08ca8" />
    </div>
    <div class="edge-peek" v-if="isLeftEdge || isRightEdge || isTopEdge || isBottomEdge">
      <cute-icon name="apps-o" size="16" color="rgba(255,255,255,0.7)" />
    </div>
  </div>

  <!-- 🍎 ModernSheet 弹出层（含原生丝滑下滑关闭） -->
  <ModernSheet v-model="showPanel" title="模块切换">
    <div class="cc-subtitle">轻点切换配置模块</div>
    <div class="cc-grid">
      <div
        v-for="m in filteredModules"
        :key="m.key"
        class="cc-tile"
        :class="{ 'cc-tile--active': m.key === currentModule }"
        @click="selectModule(m.key)"
      >
        <div class="cc-tile-icon" :class="{ 'cc-tile-icon--active': m.key === currentModule }">
          <cute-icon :name="m.icon" size="22" :color="m.key === currentModule ? '#fff' : m.color" />
        </div>
        <span class="cc-tile-label" :class="{ 'cc-tile-label--active': m.key === currentModule }">
          {{ m.label }}
        </span>
      </div>
    </div>

    <!-- 滑动方向切换按钮 -->
    <div class="cc-swipe-toggle-wrap">
      <button class="cc-swipe-toggle" @click="toggleSwipeDirection">
        <cute-icon
          :name="swipeDirection === 'horizontal' ? 'arrow-right' : 'arrow-down'"
          size="14"
          color="#8e8e93"
        />
        <span>{{ swipeDirection === 'horizontal' ? '左右滑动' : '上下滑动' }}</span>
      </button>
    </div>
  </ModernSheet>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CuteIcon from './CuteIcon.vue'
import ModernSheet from './ModernSheet.vue'

const STORAGE_KEY = 'currentSelectedModule'
const SIZE = 44
const PEEK = 14
const STORAGE_POS = 'moduleFabPos'

const SWIPE_DIR_STORAGE_KEY = 'swipeDirection'

const props = defineProps({
  gameId: { type: Number, default: 1 },
  isVip: { type: Boolean, default: false },
  currentModule: { type: String, default: 'enable' },
})

const emit = defineEmits(['update:currentModule', 'update:swipeDirection'])

const swipeDirection = ref(localStorage.getItem(SWIPE_DIR_STORAGE_KEY) || 'horizontal')

function toggleSwipeDirection() {
  const newDir = swipeDirection.value === 'horizontal' ? 'vertical' : 'horizontal'
  swipeDirection.value = newDir
  localStorage.setItem(SWIPE_DIR_STORAGE_KEY, newDir)
  emit('update:swipeDirection', newDir)
}

const showPanel = ref(false)
const fabRef = ref(null)

const fabX = ref(window.innerWidth - SIZE - 20)
const fabY = ref(window.innerHeight - 280)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragOriginX = ref(0)
const dragOriginY = ref(0)

const fabStyle = computed(() => ({
  left: fabX.value + 'px',
  top: fabY.value + 'px',
  width: SIZE + 'px',
  height: SIZE + 'px',
}))

const edgeThreshold = 20
const isLeftEdge = ref(false)
const isRightEdge = ref(false)
const isTopEdge = ref(false)
const isBottomEdge = ref(false)

const edgeClass = computed(() => {
  if (!isLeftEdge.value && !isRightEdge.value && !isTopEdge.value && !isBottomEdge.value) return ''
  return {
    'edge-left': isLeftEdge.value,
    'edge-right': isRightEdge.value,
    'edge-top': isTopEdge.value,
    'edge-bottom': isBottomEdge.value,
  }
})

const snapToEdge = (x, y, skipSave) => {
  const vw = window.innerWidth
  const vh = window.innerHeight
  let newX = x,
    newY = y
  if (x < edgeThreshold) {
    newX = PEEK - SIZE
    isLeftEdge.value = true
    isRightEdge.value = false
  } else if (x + SIZE > vw - edgeThreshold) {
    newX = vw - PEEK
    isRightEdge.value = true
    isLeftEdge.value = false
  } else {
    isLeftEdge.value = false
    isRightEdge.value = false
  }
  if (newY < edgeThreshold) {
    newY = PEEK - SIZE
    isTopEdge.value = true
    isBottomEdge.value = false
  } else if (newY + SIZE > vh - edgeThreshold) {
    newY = vh - PEEK
    isBottomEdge.value = true
    isTopEdge.value = false
  } else {
    isTopEdge.value = false
    isBottomEdge.value = false
  }
  fabX.value = newX
  fabY.value = newY
  if (!skipSave) localStorage.setItem(STORAGE_POS, JSON.stringify({ x: newX, y: newY }))
}

const startDrag = (e) => {
  if (e.cancelable) e.preventDefault()
  if (isLeftEdge.value) {
    fabX.value = 4
    isLeftEdge.value = false
  } else if (isRightEdge.value) {
    fabX.value = window.innerWidth - SIZE - 4
    isRightEdge.value = false
  }
  if (isTopEdge.value) {
    fabY.value = 4
    isTopEdge.value = false
  } else if (isBottomEdge.value) {
    fabY.value = window.innerHeight - SIZE - 4
    isBottomEdge.value = false
  }
  isDragging.value = false
  const pos = e.touches ? e.touches[0] : e
  dragStartX.value = pos.clientX
  dragStartY.value = pos.clientY
  dragOriginX.value = fabX.value
  dragOriginY.value = fabY.value
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', endDrag)
}

const onDrag = (e) => {
  const pos = e.touches ? e.touches[0] : e
  const dx = pos.clientX - dragStartX.value
  const dy = pos.clientY - dragStartY.value
  if (Math.sqrt(dx * dx + dy * dy) > 5) isDragging.value = true
  let newX = dragOriginX.value + dx
  let newY = dragOriginY.value + dy
  newX = Math.max(-SIZE * 0.4, Math.min(window.innerWidth - SIZE * 0.6, newX))
  newY = Math.max(-SIZE * 0.4, Math.min(window.innerHeight - SIZE * 0.6, newY))
  fabX.value = newX
  fabY.value = newY
}

const endDrag = () => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)
  if (isDragging.value) {
    snapToEdge(fabX.value, fabY.value)
    isDragging.value = false
    return
  }
  isDragging.value = false
  if (isLeftEdge.value || isRightEdge.value || isTopEdge.value || isBottomEdge.value) {
    if (isLeftEdge.value) fabX.value = 4
    else if (isRightEdge.value) fabX.value = window.innerWidth - SIZE - 4
    if (isTopEdge.value) fabY.value = 4
    else if (isBottomEdge.value) fabY.value = window.innerHeight - SIZE - 4
    isLeftEdge.value = false
    isRightEdge.value = false
    isTopEdge.value = false
    isBottomEdge.value = false
    localStorage.setItem(STORAGE_POS, JSON.stringify({ x: fabX.value, y: fabY.value }))
  } else {
    showPanel.value = true
  }
}

const handleResize = () => {
  const vw = window.innerWidth
  const vh = window.innerHeight
  let x = fabX.value,
    y = fabY.value
  if (x + SIZE > vw) x = vw - SIZE - 4
  if (x < 0) x = 4
  if (y + SIZE > vh) y = vh - SIZE - 4
  if (y < 0) y = 4
  fabX.value = x
  fabY.value = y
  snapToEdge(x, y, true)
}

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_POS))
    if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
      fabX.value = saved.x
      fabY.value = saved.y
    }
  } catch {}
  snapToEdge(fabX.value, fabY.value, true)
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const allModuleDefs = computed(() => [
  { key: 'enable', label: '启用配置', icon: 'calendar-clock', color: '#5b8def', gameId: [1, 2] },
  { key: 'plant', label: '自动种植', icon: 'breed', color: '#5fcb8a', gameId: [1, 2] },
  { key: 'order', label: '订单管理', icon: 'order', color: '#f5a623', gameId: [1, 2] },
  { key: 'alt', label: '小号管理', icon: 'users', color: '#fc7b6b', gameId: [1] },
  { key: 'stealFlower', label: '摸花管理', icon: 'flower', color: '#a29bfe', gameId: [1] },
  { key: 'steal', label: '摸花/爬架', icon: 'flower', color: '#a29bfe', gameId: [2] },
  { key: 'shop', label: '店铺管理', icon: 'shop', color: '#4ecdc4', gameId: [1] },
  { key: 'guild', label: '公会配置', icon: 'bank', color: '#f0932b', gameId: [1, 2] },
  { key: 'exchangeCode', label: '兑换码', icon: 'gift-voucher', color: '#eb4d4b', gameId: [2] },
  { key: 'activity', label: '活动配置', icon: 'calendar-heart', color: '#6c5ce7', gameId: [2] },
  { key: 'autoAd', label: '自动广告', icon: 'ad-slash', color: '#00cec9', gameId: [2] },
  { key: 'other', label: '其他配置', icon: 'settings', color: '#636e72', gameId: [1, 2] },
])

const filteredModules = computed(() =>
  allModuleDefs.value.filter((m) => m.gameId.includes(props.gameId)),
)

const moduleIconMap = {
  enable: 'calendar-clock',
  plant: 'breed',
  order: 'order',
  alt: 'users',
  stealFlower: 'flower',
  steal: 'flower',
  shop: 'shop',
  guild: 'bank',
  exchangeCode: 'gift-voucher',
  activity: 'calendar-heart',
  autoAd: 'ad-slash',
  other: 'settings',
}
const currentModuleIcon = computed(() => moduleIconMap[props.currentModule] || 'apps-o')

function selectModule(key) {
  console.log('[ModuleSelector] selectModule:', key, 'currentModule prop:', props.currentModule)
  emit('update:currentModule', key)
  localStorage.setItem(STORAGE_KEY, key)
  showPanel.value = false
}
</script>

<style scoped>
/* ============================================================
   🍎 ModuleSelector — iOS 17 控制中心风格
   ============================================================ */

/* ---------- FAB 入口按钮（磨砂圆形） ---------- */
.module-fab {
  position: fixed;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  border: 0.5px solid rgba(255, 255, 255, 0.8);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.03),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  z-index: 1000;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  will-change: left, top;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.module-fab:active {
  cursor: grabbing;
  transform: scale(0.92);
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.08),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.9);
}

.fab-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 靠边 */
.module-fab.edge-left {
  border-radius: 0 50% 50% 0;
}
.module-fab.edge-right {
  border-radius: 50% 0 0 50%;
}
.module-fab.edge-top {
  border-radius: 0 0 50% 50%;
}
.module-fab.edge-bottom {
  border-radius: 50% 50% 0 0;
}

.edge-peek {
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

/* ============================================================
   🍎 ModernSheet 内部内容样式
   ============================================================ */

.cc-subtitle {
  font-size: 13px;
  color: #86868b;
  margin: -4px 0 10px 20px;
  font-weight: 400;
  letter-spacing: 0;
}

/* 2列网格 */
.cc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 4px 20px 24px;
}

.cc-tile {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 0.5px solid rgba(255, 255, 255, 0.5);
  border-radius: 14px;
  padding: 12px 8px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.8);
  -webkit-tap-highlight-color: transparent;
}

.cc-tile:active {
  transform: scale(0.94);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.cc-tile--active {
  background: linear-gradient(145deg, #f0dee8 0%, #e8d4e0 100%);
  border-color: rgba(200, 160, 180, 0.3);
  box-shadow:
    0 4px 12px rgba(180, 120, 140, 0.12),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.6);
}

.cc-tile-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 242, 247, 0.4);
  transition: all 0.2s ease;
}

.cc-tile-icon--active {
  background: linear-gradient(135deg, #e8b4c8 0%, #d4a0b8 50%, #c08ca8 100%);
  box-shadow: 0 4px 10px rgba(180, 120, 140, 0.25);
}

.cc-tile-label {
  font-size: 11px;
  font-weight: 500;
  color: #6b5e6b;
  text-align: center;
  line-height: 1.2;
  letter-spacing: 0.1px;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', sans-serif;
}

.cc-tile-label--active {
  color: #5a3d5a;
  font-weight: 600;
}

/* ---------- 滑动方向切换按钮 ---------- */
.cc-swipe-toggle-wrap {
  padding: 0 20px 20px;
  display: flex;
  justify-content: center;
}

.cc-swipe-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 0.5px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  color: #8e8e93;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.cc-swipe-toggle:active {
  transform: scale(0.94);
  background: rgba(255, 255, 255, 0.8);
}
</style>
