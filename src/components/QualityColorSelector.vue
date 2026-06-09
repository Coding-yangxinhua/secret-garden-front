<template>
  <div class="quality-color-selector">
    <div class="section-title" v-if="showTitle">
      <van-icon name="check-circle-o" size="16" color="#8c8c8c" />
      <span>{{ title || '选择品质' }}</span>
    </div>

    <div class="accept-type-section">
      <div class="accept-type-container">
        <div
          v-for="colorOption in colorOptions"
          :key="colorOption.value"
          class="accept-type-option"
          :class="[
            isSelectedColor(colorOption.value) ? 'selected' : '',
            `color-${colorOption.value}`,
          ]"
          @click="toggleColor(colorOption.value)"
        >
          <span>{{ colorOption.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 核心逻辑完全不变
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  title: { type: String, default: '选择品质' },
  showTitle: { type: Boolean, default: true },
  colorOptions: {
    type: Array,
    default: () => [
      { text: '绿', value: 1, bgColor: '#73b185' },
      { text: '蓝', value: 2, bgColor: '#6b92b3' },
      { text: '紫', value: 3, bgColor: '#a28fd0' },
      { text: '橙', value: 4, bgColor: '#ffb84d' },
      { text: '红', value: 5, bgColor: '#e64c65' },
    ],
  },
})

const emit = defineEmits(['update:modelValue'])

const isSelectedColor = (colorId) => {
  return props.modelValue.includes(colorId)
}

const toggleColor = (colorId) => {
  const currentSelection = [...props.modelValue]
  const index = currentSelection.indexOf(colorId)
  index > -1 ? currentSelection.splice(index, 1) : currentSelection.push(colorId)
  emit('update:modelValue', currentSelection)
}
</script>

<style scoped>
/* ============================================================
   🍎 QualityColorSelector – iOS 17 Settings 风格（紧凑版）
   ============================================================
   设计理念：
   - 每个品质 = [小色点 + 单字标签]，行内水平排列
   - 选中时色点外圈高亮 + 右侧浮现绿色 ✓
   - 极致紧凑，不占空间
   ============================================================ */

.quality-color-selector {
  width: 100%;
  margin-top: 4px;
}

/* ---------- 分段标题 ---------- */
.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.3px;
  color: var(--apple-text-secondary, #86868b);
  margin: 0 0 8px;
  text-transform: uppercase;
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
}

/* ---------- 容器 ---------- */
.accept-type-section {
  margin-bottom: 0;
}

.accept-type-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ---------- 品质选项（行内 = 色点 + 文字） ---------- */
.accept-type-option {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px 5px 9px;
  background: rgba(242, 242, 247, 0.5);
  border-radius: 16px;
  border: 0.5px solid rgba(60, 60, 67, 0.06);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.accept-type-option:active {
  opacity: 0.6;
}

/* ---------- 小色点（8px 圆点） ---------- */
.accept-type-option::before {
  content: '';
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--quality-color, #c7c7cc);
  flex-shrink: 0;
  transition: all 0.2s ease;
}

/* 选中时色点变大 + 外圈辉光 */
.accept-type-option.selected::before {
  width: 12px;
  height: 12px;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--quality-color, #c7c7cc) 25%, transparent);
}

/* ---------- 选中 ✓ 标记（文字右侧绿色小勾） ---------- */
.accept-type-option::after {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #34c759;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  line-height: 16px;
  text-align: center;
  flex-shrink: 0;
  opacity: 0;
  transform: scale(0.3);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-left: 1px;
}

.accept-type-option.selected::after {
  content: '✓';
  opacity: 1;
  transform: scale(1);
}

/* ---------- 文字标签 ---------- */
.accept-type-option span {
  font-size: 13px;
  font-weight: 500;
  color: var(--apple-text-secondary, #86868b);
  transition: color 0.2s ease;
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
  letter-spacing: 0.1px;
  line-height: 1;
}

.accept-type-option.selected span {
  color: var(--apple-text-primary, #1d1d1f);
  font-weight: 600;
}

/* ---------- 各品质颜色 ---------- */
.color-1 {
  --quality-color: #7cbd8e;
}
.color-2 {
  --quality-color: #7a9fc5;
}
.color-3 {
  --quality-color: #b09fda;
}
.color-4 {
  --quality-color: #ffc266;
}
.color-5 {
  --quality-color: #f05c74;
}
</style>
