<template>
  <!-- ========== 🍎 SingleSelectSheet – 通用单选弹出层 ========== -->
  <van-popup
    :show="modelValue"
    @update:show="$emit('update:modelValue', $event)"
    round
    position="bottom"
    :overlay-class="'single-sheet-overlay'"
    :close-on-click-overlay="true"
    :lazy-render="false"
    :teleport="'body'"
    @closed="$emit('closed')"
  >
    <div class="single-sheet">
      <!-- 拖拽指示器 -->
      <div class="single-sheet-affordance">
        <div class="single-sheet-drag-indicator"></div>
      </div>

      <!-- 头部 -->
      <div class="single-sheet-header">
        <span class="single-sheet-title">{{ title }}</span>
        <button class="single-sheet-close" @click="$emit('update:modelValue', false)">
          <van-icon name="close" size="14" />
        </button>
      </div>

      <!-- 选项列表 -->
      <div class="single-sheet-list">
        <button
          v-for="(opt, i) in optionsRef"
          :key="opt.value"
          class="single-sheet-item"
          :class="{ 'is-selected': localValue === opt.value }"
          @click="onSelect(opt)"
          :style="{ '--stagger': i }"
        >
          <span class="single-sheet-item-text">{{ opt.text }}</span>
          <span v-if="localValue === opt.value" class="single-sheet-item-check">
            <van-icon name="success" size="16" color="#007AFF" />
          </span>
        </button>
      </div>

      <div class="single-sheet-safe-bottom"></div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  /** v-model 显示/隐藏 */
  modelValue: { type: Boolean, default: false },
  /** 标题 */
  title: { type: String, default: '请选择' },
  /** 当前选中的值 */
  currentValue: { type: [Number, String], default: 0 },
  /** 选项列表：{ text: string, value: any } */
  options: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'update:currentValue', 'closed'])

/** 内部选中值，打开时从 currentValue 同步 */
const localValue = ref(props.currentValue)

/** 响应式选项（简单展开，支持 children 但不渲染二级，直接用 value 做匹配） */
const optionsRef = computed(() => {
  if (!props.options || props.options.length === 0) return []
  return props.options.map((opt) => ({
    text: opt.text,
    value: opt.value,
  }))
})

/** 打开时同步外部当前值 */
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      localValue.value = props.currentValue
    }
  },
)

const onSelect = (opt) => {
  localValue.value = opt.value
  emit('update:currentValue', opt.value)
  emit('update:modelValue', false)
}
</script>

<style>
/* ============================================================
   🍎 SingleSelectSheet 样式（全局，适配 teleport="body"）
   ============================================================ */

/* ---------- 覆盖层 ---------- */
.single-sheet-overlay {
  background: rgba(0, 0, 0, 0.4) !important;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

/* ---------- Sheet 容器 ---------- */
.single-sheet {
  --sheet-bg: rgba(250, 249, 251, 0.88);
  background: var(--sheet-bg);
  backdrop-filter: blur(48px) saturate(1.6);
  -webkit-backdrop-filter: blur(48px) saturate(1.6);
  overflow: hidden;
  border-radius: 22px 22px 0 0;
}

/* ---------- 拖拽指示器 ---------- */
.single-sheet-affordance {
  display: flex;
  justify-content: center;
  padding: 8px 0 4px;
}

.single-sheet-drag-indicator {
  width: 36px;
  height: 5px;
  background: rgba(60, 60, 67, 0.15);
  border-radius: 3px;
}

/* ---------- 头部 ---------- */
.single-sheet-header {
  padding: 8px 20px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.single-sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: 0.2px;
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
}

.single-sheet-close {
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

.single-sheet-close:active {
  background: rgba(142, 142, 147, 0.22);
  transform: scale(0.92);
}

/* ---------- 选项列表 ---------- */
.single-sheet-list {
  padding: 4px 16px 8px;
  max-height: 420px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.single-sheet-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 13px 12px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
  text-align: left;
  animation: sheetItemAppear 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--stagger, 0) * 0.04s);
}

.single-sheet-item:active {
  background: rgba(229, 229, 234, 0.7);
  transform: scale(0.985);
}

.single-sheet-item.is-selected {
  background: rgba(0, 122, 255, 0.06);
}

.single-sheet-item-text {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
  line-height: 1.4;
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
}

.single-sheet-item.is-selected .single-sheet-item-text {
  color: #007aff;
  font-weight: 600;
}

.single-sheet-item-check {
  flex-shrink: 0;
  margin-left: 8px;
  animation: sheetCheckPop 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.single-sheet-safe-bottom {
  height: env(safe-area-inset-bottom, 12px);
}

/* ---------- 动画 ---------- */
@keyframes sheetItemAppear {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes sheetCheckPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
