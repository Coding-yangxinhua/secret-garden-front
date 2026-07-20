<template>
  <!-- ========== 🍎 通用 Modern Sheet 弹出层 ========== -->
  <van-popup
    :show="modelValue"
    @update:show="$emit('update:modelValue', $event)"
    round
    position="bottom"
    :overlay-class="'modern-sheet-overlay'"
    :close-on-click-overlay="true"
    :teleport="'body'"
    :z-index="5000"
    @closed="$emit('closed')"
    @touchstart="onDragStart"
    @touchmove="onDragMove"
    @touchend="onDragEnd($event, () => $emit('update:modelValue', false))"
  >
    <div class="modern-sheet">
      <!-- 拖拽指示器 -->
      <div class="modern-sheet-affordance">
        <div class="modern-sheet-drag-indicator"></div>
      </div>

      <!-- 头部 -->
      <div class="modern-sheet-header">
        <span class="modern-sheet-title">{{ title }}</span>
        <button class="modern-sheet-close" @click="$emit('update:modelValue', false)">
          <van-icon name="close" size="14" />
        </button>
      </div>

      <!-- 默认插槽：自定义内容 -->
      <slot />
    </div>
  </van-popup>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  /** v-model 绑定显示/隐藏 */
  modelValue: { type: Boolean, default: false },
  /** 标题文字 */
  title: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'closed'])

// ---------- 下滑关闭手势 ----------
const DRAG_THRESHOLD = 80
const dragStartY = ref(0)
const dragOffsetY = ref(0)
const isDragging = ref(false)

const onDragStart = (e) => {
  dragStartY.value = e.touches[0].clientY
  dragOffsetY.value = 0
  isDragging.value = true
}

const onDragMove = (e) => {
  if (!isDragging.value) return
  const currentY = e.touches[0].clientY
  const diff = currentY - dragStartY.value
  if (diff > 0) {
    dragOffsetY.value = diff
    const popupEl = e.currentTarget
    if (popupEl) {
      popupEl.style.transform = `translateY(${diff}px)`
      popupEl.style.transition = 'none'
    }
  }
}

const onDragEnd = (e, closeFn) => {
  if (!isDragging.value) return
  isDragging.value = false

  const popupEl = e.currentTarget
  if (popupEl) {
    popupEl.style.transform = ''
    popupEl.style.transition = ''
  }

  if (dragOffsetY.value > DRAG_THRESHOLD) {
    closeFn()
  }
  dragOffsetY.value = 0
}
</script>

<style scoped>
/* ============================================================
   🍎 ModernSheet – 现代 iOS 17+ 风格弹出层
   ============================================================ */

/* Vant Popup 覆盖层 – 渐入渐出 spring */
:deep(.van-overlay) {
  transition: opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

:deep(.modern-sheet-overlay) {
  background: rgba(0, 0, 0, 0.4) !important;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

:deep(.van-popup--bottom) {
  transition:
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.35s ease !important;
}

:deep(.van-popup--bottom.van-popup--round) {
  border-radius: 22px 22px 0 0 !important;
}

:deep(.van-popup--bottom.van-popup--round::before) {
  display: none;
}

/* Sheet 容器 */
.modern-sheet {
  --sheet-bg: rgba(250, 249, 251, 0.88);
  background: var(--sheet-bg);
  backdrop-filter: blur(48px) saturate(1.6);
  -webkit-backdrop-filter: blur(48px) saturate(1.6);
  overflow: hidden;
}

/* 拖拽指示器 */
.modern-sheet-affordance {
  display: flex;
  justify-content: center;
  padding: 8px 0 4px;
}

.modern-sheet-drag-indicator {
  width: 36px;
  height: 5px;
  background: rgba(60, 60, 67, 0.15);
  border-radius: 3px;
  transition: background 0.2s ease;
}

/* Header */
.modern-sheet-header {
  padding: 8px 20px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modern-sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: 0.2px;
}

.modern-sheet-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  background: rgba(142, 142, 147, 0.12);
  color: #86868b;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.modern-sheet-close:active {
  background: rgba(142, 142, 147, 0.22);
  transform: scale(0.92);
}

/* 安全区 */
.modern-sheet-safe-bottom {
  height: env(safe-area-inset-bottom, 12px);
}
</style>
