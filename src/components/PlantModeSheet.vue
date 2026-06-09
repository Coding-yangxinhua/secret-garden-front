<template>
  <ModernSheet
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    @closed="onSheetClosed"
    title="选择种植模式"
  >
    <!-- 主列表（第一级） -->
    <div v-if="!showSubOptions" class="modern-sheet-list">
      <button
        v-for="(opt, i) in flatMainOptions"
        :key="opt.value"
        class="modern-sheet-item"
        :class="{ 'is-selected': mainSelectedValue === opt.value }"
        @click="onSelectMain(opt)"
        :style="{ '--stagger': i }"
      >
        <span class="modern-sheet-item-text">{{ opt.text }}</span>
        <span v-if="opt.children" class="modern-sheet-item-chevron">
          <van-icon name="arrow" size="14" color="#C7C7CC" />
        </span>
        <span v-else-if="mainSelectedValue === opt.value" class="modern-sheet-item-check">
          <van-icon name="success" size="16" color="#007AFF" />
        </span>
      </button>
    </div>

    <!-- 子选项列表（第二级） -->
    <div v-if="showSubOptions" class="modern-sheet-list">
      <div class="modern-sheet-sub-header">
        <button class="modern-sheet-back" @click="showSubOptions = false">
          <van-icon name="arrow-left" size="16" color="#007AFF" />
        </button>
        <span class="modern-sheet-sub-title">{{ subParentTitle }}</span>
      </div>
      <button
        v-for="(opt, i) in subOptions"
        :key="opt.value"
        class="modern-sheet-item"
        :class="{ 'is-selected': modelValue === opt.value }"
        @click="onSelectSub(opt)"
        :style="{ '--stagger': i }"
      >
        <span class="modern-sheet-item-text">{{ opt.text }}</span>
        <span v-if="modelValue === opt.value" class="modern-sheet-item-check">
          <van-icon name="success" size="16" color="#007AFF" />
        </span>
      </button>
    </div>
    <div class="modern-sheet-safe-bottom"></div>
  </ModernSheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ModernSheet from './ModernSheet.vue'

const props = defineProps({
  /** v-model 显示/隐藏 */
  modelValue: { type: Boolean, default: false },
  /** 当前选中的值（用于高亮和 emit） */
  currentValue: { type: Number, default: 0 },
  /** 第一级选项列表 */
  options: { type: Array, default: () => [] },
  /** 选中值到文字映射 */
  valueMap: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'update:currentValue'])

// 二级选择状态
const showSubOptions = ref(false)
const subParentTitle = ref('')
const subOptions = ref([])
const mainSelectedValue = ref(0)

// 展平第一级选项
const flatMainOptions = computed(() => {
  if (!props.options || props.options.length === 0) return []
  return props.options.map((opt) => ({
    text: opt.text,
    value: opt.value,
    children: opt.children || null,
  }))
})

// 选择主选项
const onSelectMain = (opt) => {
  if (opt.children && opt.children.length > 0) {
    subParentTitle.value = opt.text
    subOptions.value = opt.children
    showSubOptions.value = true
  } else {
    emit('update:currentValue', opt.value)
    mainSelectedValue.value = opt.value
    emit('update:modelValue', false)
  }
}

// 选择子选项
const onSelectSub = (opt) => {
  emit('update:currentValue', opt.value)
  mainSelectedValue.value = opt.value
  emit('update:modelValue', false)
  showSubOptions.value = false
}

// 打开时重置
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      mainSelectedValue.value = props.currentValue
      showSubOptions.value = false
    }
  },
)

const onSheetClosed = () => {
  showSubOptions.value = false
}
</script>

<style scoped>
/* 列表容器 */
.modern-sheet-list {
  padding: 4px 16px 8px;
  max-height: 420px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 列表项 */
.modern-sheet-item {
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
  animation: iosItemAppear 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--stagger, 0) * 0.04s);
}

.modern-sheet-item:active {
  background: rgba(229, 229, 234, 0.7);
  transform: scale(0.985);
}

.modern-sheet-item.is-selected {
  background: rgba(0, 122, 255, 0.06);
}

.modern-sheet-item-text {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
  line-height: 1.4;
}

.modern-sheet-item.is-selected .modern-sheet-item-text {
  color: #007aff;
  font-weight: 600;
}

.modern-sheet-item-chevron {
  flex-shrink: 0;
  margin-left: 8px;
  opacity: 0.5;
}

.modern-sheet-item-check {
  flex-shrink: 0;
  margin-left: 8px;
  animation: checkPop 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

/* 二级返回头 */
.modern-sheet-sub-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0 12px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(60, 60, 67, 0.06);
}

.modern-sheet-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.modern-sheet-back:active {
  background: rgba(229, 229, 234, 0.7);
}

.modern-sheet-sub-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.modern-sheet-safe-bottom {
  height: env(safe-area-inset-bottom, 12px);
}

/* 动画 */
@keyframes iosItemAppear {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes checkPop {
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
