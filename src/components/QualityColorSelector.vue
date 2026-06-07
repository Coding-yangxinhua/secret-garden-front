<template>
  <div class="quality-color-selector">
    <div class="section-title" v-if="showTitle">
      <van-icon name="check-circle-o" size="16" color="#8c8c8c" />
      <span>{{ title || '选择品质' }}</span>
    </div>

    <div class="accept-type-section">
      <div class="accept-type-wrapper">
        <div class="accept-type-container">
          <div
            v-for="colorOption in colorOptions"
            :key="colorOption.value"
            class="accept-type-option"
            :class="[
              isSelectedColor(colorOption.value) ? 'selected' : '',
              `color-${colorOption.value}`
            ]"
            @click="toggleColor(colorOption.value)"
          >
            {{ colorOption.text }}
          </div>
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
    ]
  }
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
.quality-color-selector {
  width: 100%;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #8c8c8c;
  margin: 10px 0 8px;
}

.accept-type-section {
  margin-bottom: 12px;
}
.accept-type-wrapper {
  border: 1px solid #ffe0ef;
  border-radius: 14px;
  padding: 12px;
  background: #fffafc;
  box-shadow: 0 2px 8px rgba(255, 182, 219, 0.08);
}
.accept-type-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.accept-type-option {
  position: relative;
  padding: 6px 12px;
  border: 1px solid #f8d0e1;
  border-radius: 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: #ffffff;
  user-select: none;
}

/* ============= 永久显示的小框（永远不消失） ============= */
.accept-type-option::before {
  content: "";
  position: absolute;
  top: -1px;
  right: -1px;
  width: 12px;
  height: 12px;
  background: #fff;
  border: 1px solid #f8d0e1;
  border-radius: 4px;
  z-index: 1;
}

/* ============= 未选中：居中红色 × ============= */
.accept-type-option::after {
  content: "×";
  position: absolute;
  top: -1px;
  right: -1px;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #f57185;
  font-weight: normal;
  z-index: 2;
}

/* ============= 选中：居中绿色 √（覆盖×） ============= */
.accept-type-option.selected::after {
  content: "✓";
  color: #07c160;
}

.accept-type-option:hover {
  border-color: #ffa9d3;
  background: #fff0f7;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(255, 133, 192, 0.1);
}

.accept-type-option.selected {
  color: #fff;
  font-weight: 500;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

/* 原有颜色样式不变 */
.accept-type-option.color-1.selected { background: #7cbd8e; border-color: #7cbd8e; }
.accept-type-option.color-2.selected { background: #7a9fc5; border-color: #7a9fc5; }
.accept-type-option.color-3.selected { background: #b09fda; border-color: #b09fda; }
.accept-type-option.color-4.selected { background: #ffc266; border-color: #ffc266; }
.accept-type-option.color-5.selected { background: #f05c74; border-color: #f05c74; }
</style>